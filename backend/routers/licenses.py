from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from database.connection import get_db
from schemas import LicenseCreate, LicenseUpdate, LicenseOut
from routers.auth import get_current_user, require_admin
from services import (
    get_licenses, get_license_by_id, create_license, update_license, delete_license,
    create_notification, log_activity
)

router = APIRouter(prefix="/api/licenses", tags=["licenses"])

@router.get("", response_model=List[LicenseOut])
def list_licenses(current_user = Depends(get_current_user), db: Session = Depends(get_db)):
    return get_licenses(db)

@router.post("", response_model=LicenseOut)
def add_license(
    payload: LicenseCreate,
    current_user = Depends(require_admin),
    db: Session = Depends(get_db)
):
    if payload.id:
        existing = get_license_by_id(db, payload.id)
        if existing:
            raise HTTPException(status_code=400, detail="License ID already exists")
            
    return create_license(db, payload.model_dump(), current_user.name)

@router.put("/{id}", response_model=LicenseOut)
def edit_license(
    id: str,
    payload: LicenseUpdate,
    current_user = Depends(require_admin),
    db: Session = Depends(get_db)
):
    existing = get_license_by_id(db, id)
    if not existing:
        raise HTTPException(status_code=404, detail="License not found")
        
    return update_license(db, id, payload.model_dump(exclude_unset=True), current_user.name)

@router.delete("/{id}")
def remove_license(id: str, current_user = Depends(require_admin), db: Session = Depends(get_db)):
    success = delete_license(db, id, current_user.name)
    if not success:
        raise HTTPException(status_code=404, detail="License not found")
    return {"message": "License deleted successfully"}

@router.post("/{id}/alert")
def trigger_alert(id: str, current_user = Depends(require_admin), db: Session = Depends(get_db)):
    lic = get_license_by_id(db, id)
    if not lic:
        raise HTTPException(status_code=404, detail="License not found")
        
    msg = f"System sent email notification to Admin ({lic.admin_email}) regarding software license \"{lic.name}\" expiring on {lic.end_date}."
    create_notification(db, "License Expiry Email Alert", msg, "alert")
    log_activity(db, current_user.name, "Email Alert Sent", f"Email alert sent to {lic.admin_email} for license \"{lic.name}\" expiring on {lic.end_date}")
    return {"message": "Expiry alert triggered successfully"}
