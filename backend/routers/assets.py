from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from database.connection import get_db
from schemas import AssetCreate, AssetUpdate, AssetOut, AssetAssignRequest, AssetReturnRequest
from routers.auth import get_current_user, require_admin
from services import (
    get_assets, get_asset_by_id, create_asset, update_asset, delete_asset,
    assign_assets_service, return_assets_service
)

router = APIRouter(prefix="/api/assets", tags=["assets"])

@router.get("", response_model=List[AssetOut])
def list_assets(
    search: Optional[str] = None,
    type_filter: Optional[str] = None,
    scope_filter: Optional[str] = None,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return get_assets(db, search, type_filter, scope_filter)

@router.get("/{id}", response_model=AssetOut)
def get_asset(id: str, current_user = Depends(get_current_user), db: Session = Depends(get_db)):
    asset = get_asset_by_id(db, id)
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")
    return asset

@router.post("", response_model=AssetOut)
def add_asset(
    payload: AssetCreate,
    current_user = Depends(require_admin),
    db: Session = Depends(get_db)
):
    existing = get_asset_by_id(db, payload.id)
    if existing:
        raise HTTPException(status_code=400, detail=f"Asset ID {payload.id} already exists")
    
    # Check duplicate serial number
    from sqlalchemy import text
    serial_exists = db.execute(text("SELECT id FROM assets WHERE serial_number = :sn"), {"sn": payload.serial_number}).first()
    if serial_exists:
        raise HTTPException(status_code=400, detail=f"Asset with serial number {payload.serial_number} already exists")
        
    return create_asset(db, payload.model_dump(), current_user.name)

@router.put("/{id}", response_model=AssetOut)
def edit_asset(
    id: str,
    payload: AssetUpdate,
    current_user = Depends(require_admin),
    db: Session = Depends(get_db)
):
    existing = get_asset_by_id(db, id)
    if not existing:
        raise HTTPException(status_code=404, detail="Asset not found")
        
    return update_asset(db, id, payload.model_dump(exclude_unset=True), current_user.name)

@router.delete("/{id}")
def remove_asset(id: str, current_user = Depends(require_admin), db: Session = Depends(get_db)):
    success = delete_asset(db, id, current_user.name)
    if not success:
        raise HTTPException(status_code=404, detail="Asset not found")
    return {"message": "Asset deleted successfully"}

@router.post("/assign")
def assign_assets(
    payload: AssetAssignRequest,
    current_user = Depends(require_admin),
    db: Session = Depends(get_db)
):
    success = assign_assets_service(
        db, 
        payload.employee_id, 
        payload.asset_ids, 
        payload.assign_date, 
        payload.remarks, 
        current_user.name
    )
    if not success:
        raise HTTPException(status_code=400, detail="Assignment failed. Verify employee exists.")
    return {"message": f"Successfully assigned {len(payload.asset_ids)} assets"}

@router.post("/return")
def return_assets(
    payload: AssetReturnRequest,
    current_user = Depends(require_admin),
    db: Session = Depends(get_db)
):
    success = return_assets_service(
        db,
        payload.employee_id,
        payload.asset_ids,
        payload.return_date,
        payload.condition,
        payload.remarks,
        current_user.name
    )
    if not success:
        raise HTTPException(status_code=400, detail="Return failed. Verify employee exists.")
    return {"message": f"Successfully returned {len(payload.asset_ids)} assets"}

@router.post("/bulk-import")
def bulk_import_assets(
    payload: List[AssetCreate],
    current_user = Depends(require_admin),
    db: Session = Depends(get_db)
):
    success_count = 0
    failed_rows = []
    
    for idx, asset_schema in enumerate(payload):
        try:
            # Check duplicate ID or serial_number
            existing_id = get_asset_by_id(db, asset_schema.id)
            if existing_id:
                failed_rows.append({"row": idx + 2, "reason": f"Asset ID '{asset_schema.id}' already exists."})
                continue
                
            from sqlalchemy import text
            sn_exists = db.execute(text("SELECT id FROM assets WHERE serial_number = :sn"), {"sn": asset_schema.serial_number}).first()
            if sn_exists:
                failed_rows.append({"row": idx + 2, "reason": f"Serial number '{asset_schema.serial_number}' already exists."})
                continue
                
            create_asset(db, asset_schema.model_dump(), current_user.name)
            success_count += 1
        except Exception as e:
            failed_rows.append({"row": idx + 2, "reason": str(e)})
            
    return {
        "totalRows": len(payload),
        "successCount": success_count,
        "failedRows": failed_rows
    }
