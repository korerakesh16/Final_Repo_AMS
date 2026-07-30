from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List
from database.connection import get_db
from schemas import RepairCreate, RepairUpdateSchema, RepairOut
from routers.auth import get_current_user, require_admin
from services import (
    get_repairs, get_repair_by_id, get_repair_updates, create_repair,
    add_repair_update_service, accept_repair_service, reject_repair_service,
    get_active_admins, get_employee_by_id, send_ticket_raised_email_to_admins
)

router = APIRouter(prefix="/api/repairs", tags=["repairs"])

@router.get("", response_model=List[RepairOut])
def list_repairs(current_user = Depends(get_current_user), db: Session = Depends(get_db)):
    # If not Admin, filter by reported_by
    reported_by = None if current_user.role == "Admin" else current_user.id
    repairs = get_repairs(db, reported_by)
    
    # Format repair objects to include updates
    results = []
    for r in repairs:
        updates = get_repair_updates(db, r.id)
        results.append({
            "id": r.id,
            "asset_id": r.asset_id,
            "reported_by": r.reported_by,
            "issue": r.issue,
            "description": r.description,
            "request_date": r.request_date,
            "priority": r.priority,
            "assigned_to": r.assigned_to,
            "estimated_completion": r.estimated_completion,
            "status": r.status,
            "accepted_by": r.accepted_by,
            "accepted_date": r.accepted_date,
            "updates": updates,
            "created_at": r.created_at
        })
    return results

@router.get("/{id}", response_model=RepairOut)
def get_repair(id: str, current_user = Depends(get_current_user), db: Session = Depends(get_db)):
    repair = get_repair_by_id(db, id)
    if not repair:
        raise HTTPException(status_code=404, detail="Repair ticket not found")
        
    # Check auth: Admin or reported_by
    if current_user.role != "Admin" and repair.reported_by != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to view this ticket")
        
    updates = get_repair_updates(db, id)
    return {
        "id": repair.id,
        "asset_id": repair.asset_id,
        "reported_by": repair.reported_by,
        "issue": repair.issue,
        "description": repair.description,
        "request_date": repair.request_date,
        "priority": repair.priority,
        "assigned_to": repair.assigned_to,
        "estimated_completion": repair.estimated_completion,
        "status": repair.status,
        "accepted_by": repair.accepted_by,
        "accepted_date": repair.accepted_date,
        "updates": updates,
        "created_at": repair.created_at
    }

@router.post("", response_model=RepairOut)
def add_repair(
    payload: RepairCreate,
    background_tasks: BackgroundTasks,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Enforce reporter id matches current user if not admin
    if current_user.role != "Admin" and payload.reported_by != current_user.id:
        raise HTTPException(status_code=403, detail="Cannot file ticket on behalf of another employee")
        
    r = create_repair(db, payload.model_dump(), current_user.name)
    if not r:
        raise HTTPException(status_code=400, detail="Failed to create repair ticket")

    # Fetch all active admins for email dispatch
    active_admins = get_active_admins(db)
    admin_emails = [a.email for a in active_admins if hasattr(a, 'email') and a.email]

    # Fetch employee data for details
    emp_record = get_employee_by_id(db, r.reported_by)
    emp_dict = None
    if emp_record:
        emp_dict = {
            "id": emp_record.id,
            "name": emp_record.name,
            "department": emp_record.department,
            "email": emp_record.email
        }

    ticket_dict = {
        "id": r.id,
        "asset_id": r.asset_id,
        "reported_by": r.reported_by,
        "issue": r.issue,
        "description": r.description,
        "priority": r.priority,
        "request_date": r.request_date
    }

    # Dispatch email notification to all active admins in background task
    if admin_emails:
        background_tasks.add_task(
            send_ticket_raised_email_to_admins,
            admin_emails,
            ticket_dict,
            emp_dict
        )

    updates = get_repair_updates(db, r.id)
    return {
        "id": r.id,
        "asset_id": r.asset_id,
        "reported_by": r.reported_by,
        "issue": r.issue,
        "description": r.description,
        "request_date": r.request_date,
        "priority": r.priority,
        "assigned_to": r.assigned_to,
        "estimated_completion": r.estimated_completion,
        "status": r.status,
        "accepted_by": r.accepted_by,
        "accepted_date": r.accepted_date,
        "updates": updates,
        "created_at": r.created_at
    }


@router.post("/{id}/updates")
def add_update(
    id: str,
    payload: RepairUpdateSchema,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Enforce auth
    repair = get_repair_by_id(db, id)
    if not repair:
        raise HTTPException(status_code=404, detail="Repair ticket not found")
        
    if current_user.role != "Admin" and repair.reported_by != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this ticket")
        
    success = add_repair_update_service(db, id, payload.status, payload.message, current_user.name)
    if not success:
        raise HTTPException(status_code=500, detail="Update failed")
    return {"message": "Update added successfully"}

@router.post("/{id}/accept")
def accept_repair(id: str, current_user = Depends(require_admin), db: Session = Depends(get_db)):
    success = accept_repair_service(db, id, f"{current_user.name} (Admin)")
    if not success:
        raise HTTPException(status_code=404, detail="Repair ticket not found")
    return {"message": "Repair ticket accepted successfully"}

@router.post("/{id}/reject")
def reject_repair(id: str, current_user = Depends(require_admin), db: Session = Depends(get_db)):
    success = reject_repair_service(db, id, f"{current_user.name} (Admin)")
    if not success:
        raise HTTPException(status_code=404, detail="Repair ticket not found")
    return {"message": "Repair ticket cancelled successfully"}
