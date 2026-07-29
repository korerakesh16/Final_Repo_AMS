from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from database.connection import get_db
from schemas import EmployeeCreate, EmployeeUpdate, EmployeeOut
from routers.auth import get_current_user, require_admin
from services import (
    get_employees, get_employee_by_id, create_employee, update_employee, delete_employee
)

router = APIRouter(prefix="/api/employees", tags=["employees"])

@router.get("", response_model=List[EmployeeOut])
def list_employees(
    search: Optional[str] = None,
    department: Optional[str] = None,
    status: Optional[str] = None,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Returns list of employees
    # Note: Both admins and employees can retrieve employee details (e.g. for selection dropdowns)
    # But let's verify if we need to filter any sensitive fields. Pydantic EmployeeOut handles that.
    results = get_employees(db, search, department, status)
    return results

@router.get("/{id}", response_model=EmployeeOut)
def get_employee(id: str, current_user = Depends(get_current_user), db: Session = Depends(get_db)):
    employee = get_employee_by_id(db, id)
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    return employee

@router.post("", response_model=EmployeeOut)
def add_employee(
    payload: EmployeeCreate,
    current_user = Depends(require_admin),
    db: Session = Depends(get_db)
):
    # Check if duplicate ID or email/username
    existing = get_employee_by_id(db, payload.id)
    if existing:
        raise HTTPException(status_code=400, detail=f"Employee ID {payload.id} already exists")
    
    from sqlalchemy import text
    email_exists = db.execute(text("SELECT id FROM employees WHERE email = :email"), {"email": payload.email}).first()
    if email_exists:
        raise HTTPException(status_code=400, detail=f"Employee email {payload.email} is already in use")
        
    return create_employee(db, payload.model_dump(), current_user.name)

@router.put("/{id}", response_model=EmployeeOut)
def edit_employee(
    id: str,
    payload: EmployeeUpdate,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Check authorization: Admin can edit anyone. Employees can only edit themselves.
    if current_user.role != "Admin" and current_user.id != id:
        raise HTTPException(status_code=403, detail="Not authorized to edit this profile")
        
    existing = get_employee_by_id(db, id)
    if not existing:
        raise HTTPException(status_code=404, detail="Employee not found")
        
    return update_employee(db, id, payload.model_dump(exclude_unset=True), current_user.name)

@router.delete("/{id}")
def remove_employee(id: str, current_user = Depends(require_admin), db: Session = Depends(get_db)):
    success = delete_employee(db, id, current_user.name)
    if not success:
        raise HTTPException(status_code=404, detail="Employee not found")
    return {"message": "Employee deleted successfully"}

@router.post("/bulk-import")
def bulk_import(
    payload: List[EmployeeCreate],
    current_user = Depends(require_admin),
    db: Session = Depends(get_db)
):
    success_count = 0
    failed_rows = []
    
    for idx, emp_schema in enumerate(payload):
        try:
            # Check duplicate ID or email
            existing_id = get_employee_by_id(db, emp_schema.id)
            if existing_id:
                failed_rows.append({"row": idx + 2, "reason": f"Employee ID '{emp_schema.id}' already exists."})
                continue
                
            from sqlalchemy import text
            email_exists = db.execute(text("SELECT id FROM employees WHERE email = :email"), {"email": emp_schema.email}).first()
            if email_exists:
                failed_rows.append({"row": idx + 2, "reason": f"Employee with email '{emp_schema.email}' already exists."})
                continue
                
            create_employee(db, emp_schema.model_dump(), current_user.name)
            success_count += 1
        except Exception as e:
            failed_rows.append({"row": idx + 2, "reason": str(e)})
            
    return {
        "totalRows": len(payload),
        "successCount": success_count,
        "failedRows": failed_rows
    }
