from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from database.connection import get_db
from schemas import CategoryCreate, CategoryUpdate, CategoryOut
from routers.auth import get_current_user, require_admin
from services import (
    get_categories, create_category, update_category, delete_category
)

router = APIRouter(prefix="/api/categories", tags=["categories"])

@router.get("", response_model=List[CategoryOut])
def list_categories(current_user = Depends(get_current_user), db: Session = Depends(get_db)):
    return get_categories(db)

@router.post("", response_model=CategoryOut)
def add_category(
    payload: CategoryCreate,
    current_user = Depends(require_admin),
    db: Session = Depends(get_db)
):
    from sqlalchemy import text
    existing = db.execute(text("SELECT id FROM categories WHERE id = :id OR name = :name"), {"id": payload.id, "name": payload.name}).first()
    if existing:
        raise HTTPException(status_code=400, detail="Category ID or Name already exists")
        
    return create_category(db, payload.model_dump(), current_user.name)

@router.put("/{id}", response_model=CategoryOut)
def edit_category(
    id: str,
    payload: CategoryUpdate,
    current_user = Depends(require_admin),
    db: Session = Depends(get_db)
):
    from sqlalchemy import text
    existing = db.execute(text("SELECT id FROM categories WHERE id = :id"), {"id": id}).first()
    if not existing:
        raise HTTPException(status_code=404, detail="Category not found")
        
    return update_category(db, id, payload.model_dump(exclude_unset=True), current_user.name)

@router.delete("/{id}")
def remove_category(id: str, current_user = Depends(require_admin), db: Session = Depends(get_db)):
    success = delete_category(db, id, current_user.name)
    if not success:
        raise HTTPException(status_code=404, detail="Category not found")
    return {"message": "Category deleted successfully"}
