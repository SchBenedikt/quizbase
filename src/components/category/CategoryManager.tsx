"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Edit2, Trash2, Tag, Palette } from "lucide-react";
import { useFirestore, useDoc, useCollection, useMemoFirebase } from "@/firebase";
import { doc, collection, query, orderBy, where, serverTimestamp, setDoc, deleteDoc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { ThemeCategory } from "@/app/types/poll";
import { cn } from "@/lib/utils";

interface CategoryManagerProps {
  userId: string;
  selectedCategories?: string[];
  onCategoriesChange?: (categoryIds: string[]) => void;
  mode?: "manage" | "select";
}

export function CategoryManager({ userId, selectedCategories = [], onCategoriesChange, mode = "manage" }: CategoryManagerProps) {
  const db = useFirestore();
  const { toast } = useToast();
  const [categories, setCategories] = useState<ThemeCategory[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ThemeCategory | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    color: "#3b82f6",
    icon: "tag"
  });

  // Fetch user's categories and public categories
  const userCategoriesQuery = useMemoFirebase(() =>
    query(collection(db, `users/${userId}/categories`), orderBy("createdAt", "desc")),
    [db, userId]
  );
  const { data: userCategories } = useCollection<ThemeCategory>(userCategoriesQuery);

  const publicCategoriesQuery = useMemoFirebase(() =>
    query(collection(db, "categories"), where("isPublic", "==", true), orderBy("name", "asc")),
    [db]
  );
  const { data: publicCategories } = useCollection<ThemeCategory>(publicCategoriesQuery);

  useEffect(() => {
    const allCategories = [...(userCategories || []), ...(publicCategories || [])];
    setCategories(allCategories);
  }, [userCategories, publicCategories]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    try {
      const categoryData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        color: formData.color,
        icon: formData.icon,
        userId: mode === "manage" ? userId : null,
        isPublic: mode === "manage" ? false : true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      if (editingCategory) {
        const ref = doc(db, editingCategory.userId ? `users/${editingCategory.userId}/categories/${editingCategory.id}` : `categories/${editingCategory.id}`);
        await setDoc(ref, { ...categoryData, id: editingCategory.id }, { merge: true });
        toast({ title: "Category updated", description: "The category has been updated successfully." });
      } else {
        const ref = doc(collection(db, mode === "manage" ? `users/${userId}/categories` : "categories"));
        await setDoc(ref, { ...categoryData, id: ref.id });
        toast({ title: "Category created", description: "The category has been created successfully." });
      }

      resetForm();
      setIsCreateDialogOpen(false);
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    }
  };

  const handleEdit = (category: ThemeCategory) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || "",
      color: category.color || "#3b82f6",
      icon: category.icon || "tag"
    });
    setIsCreateDialogOpen(true);
  };

  const handleDelete = async (category: ThemeCategory) => {
    try {
      const ref = doc(db, category.userId ? `users/${category.userId}/categories/${category.id}` : `categories/${category.id}`);
      await deleteDoc(ref);
      toast({ title: "Category deleted", description: "The category has been deleted successfully." });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    }
  };

  const resetForm = () => {
    setFormData({ name: "", description: "", color: "#3b82f6", icon: "tag" });
    setEditingCategory(null);
  };

  const toggleCategorySelection = (categoryId: string) => {
    if (mode === "select" && onCategoriesChange) {
      const newSelection = selectedCategories.includes(categoryId)
        ? selectedCategories.filter(id => id !== categoryId)
        : [...selectedCategories, categoryId];
      onCategoriesChange(newSelection);
    }
  };

  const predefinedColors = ["#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899", "#64748b", "#84cc16"];
  const predefinedIcons = ["tag", "folder", "star", "heart", "bookmark", "flag", "target", "zap"];

  return (
    <div className="space-y-4">
      {mode === "manage" && (
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Tag className="h-5 w-5" />
            Categories
          </h3>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" onClick={resetForm}>
                <Plus className="h-4 w-4 mr-2" />
                Add Category
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingCategory ? "Edit Category" : "Create Category"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Name</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter category name"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Description</label>
                  <Input
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Enter description (optional)"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Color</label>
                  <div className="flex gap-2 flex-wrap">
                    {predefinedColors.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setFormData({ ...formData, color })}
                        className={cn(
                          "w-8 h-8 rounded-full border-2",
                          formData.color === color ? "border-gray-900" : "border-transparent"
                        )}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Icon</label>
                  <div className="flex gap-2 flex-wrap">
                    {predefinedIcons.map((icon) => (
                      <button
                        key={icon}
                        type="button"
                        onClick={() => setFormData({ ...formData, icon })}
                        className={cn(
                          "p-2 rounded border",
                          formData.icon === icon ? "border-gray-900 bg-gray-100" : "border-gray-200"
                        )}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2 pt-4">
                  <Button type="submit" className="flex-1">
                    {editingCategory ? "Update" : "Create"}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      )}

      <div className="space-y-2">
        {categories.map((category) => (
          <div
            key={category.id}
            className={cn(
              "flex items-center justify-between p-3 rounded-lg border",
              mode === "select" && "cursor-pointer hover:bg-gray-50",
              selectedCategories.includes(category.id) && "bg-blue-50 border-blue-200"
            )}
            onClick={() => mode === "select" && toggleCategorySelection(category.id)}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: category.color || "#3b82f6" }}
              />
              <div>
                <div className="font-medium">{category.name}</div>
                {category.description && (
                  <div className="text-sm text-gray-500">{category.description}</div>
                )}
              </div>
              {category.isPublic && (
                <Badge variant="secondary" className="text-xs">
                  Public
                </Badge>
              )}
            </div>
            {mode === "manage" && (
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEdit(category);
                  }}
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(category);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        ))}
        {categories.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Tag className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No categories yet</p>
            {mode === "manage" && (
              <p className="text-sm">Create your first category to organize your surveys</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
