"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/api/react";
import { Plus, Edit, Trash2, Tag, AlertCircle, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

export const dynamic = "force-dynamic";

const categorySchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  slug: z.string().min(1, "Slug is required").max(100).regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers, and hyphens only"),
  description: z.string().max(500).optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Must be a valid hex color"),
  icon: z.string().max(50).optional(),
  glAccountCode: z.string().max(50).optional(),
});

type CategoryFormValues = z.infer<typeof categorySchema>;

export default function CategoriesSettingsPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const utils = trpc.useUtils();
  const categoriesList = trpc.categories.list.useQuery();

  const createMutation = trpc.categories.create.useMutation({
    onSuccess: () => {
      toast.success("Category created successfully");
      utils.categories.list.invalidate();
      setIsCreateDialogOpen(false);
    },
    onError: (error) => {
      toast.error("Failed to create category", {
        description: error.message,
      });
    },
  });

  const updateMutation = trpc.categories.update.useMutation({
    onSuccess: () => {
      toast.success("Category updated successfully");
      utils.categories.list.invalidate();
      setEditingCategory(null);
    },
    onError: (error) => {
      toast.error("Failed to update category", {
        description: error.message,
      });
    },
  });

  const deleteMutation = trpc.categories.delete.useMutation({
    onSuccess: () => {
      toast.success("Category deleted successfully");
      utils.categories.list.invalidate();
      setDeletingId(null);
    },
    onError: (error) => {
      toast.error("Failed to delete category", {
        description: error.message,
      });
      setDeletingId(null);
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">
            Spend Categories
          </h1>
          <p className="text-slate-600 mt-1 md:mt-2 text-sm md:text-base">
            Manage custom categories for spend classification and GL mapping
          </p>
        </div>
        <Button className="w-full sm:w-auto" onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Category
        </Button>
      </div>

      {/* Loading */}
      {categoriesList.isLoading && (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </CardContent>
        </Card>
      )}

      {/* Error */}
      {categoriesList.error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-12 w-12 text-red-400 mb-4" />
            <p className="text-lg font-medium text-slate-900">
              Failed to load categories
            </p>
            <p className="text-sm text-slate-600 mt-1">
              {categoriesList.error.message}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Categories List */}
      {categoriesList.data && (
        <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 md:gap-4">
          {categoriesList.data.map((category) => (
            <Card key={category.id} className="relative">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: category.color }}
                    >
                      <Tag className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{category.name}</CardTitle>
                      <p className="text-xs text-slate-500 font-mono mt-0.5">
                        {category.slug}
                      </p>
                    </div>
                  </div>
                  {category.isSystem && (
                    <Badge variant="outline" className="text-xs">
                      System
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {category.description && (
                  <p className="text-sm text-slate-600 mb-3">
                    {category.description}
                  </p>
                )}
                {category.glAccountCode && (
                  <div className="mb-3">
                    <p className="text-xs text-slate-500">GL Account</p>
                    <p className="text-sm font-mono text-slate-900">
                      {category.glAccountCode}
                    </p>
                  </div>
                )}
                <div className="flex gap-2 pt-3 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => setEditingCategory(category)}
                    disabled={category.isSystem}
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (confirm(`Delete category "${category.name}"?`)) {
                        setDeletingId(category.id);
                        deleteMutation.mutate({ id: category.id });
                      }
                    }}
                    disabled={category.isSystem || deletingId === category.id}
                  >
                    {deletingId === category.id ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Trash2 className="h-3 w-3" />
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Dialog */}
      <CategoryDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSubmit={(data) => createMutation.mutate(data)}
        isLoading={createMutation.isPending}
      />

      {/* Edit Dialog */}
      {editingCategory && (
        <CategoryDialog
          open={!!editingCategory}
          onOpenChange={(open) => !open && setEditingCategory(null)}
          onSubmit={(data) =>
            updateMutation.mutate({ id: editingCategory.id, ...data })
          }
          isLoading={updateMutation.isPending}
          initialValues={editingCategory}
        />
      )}
    </div>
  );
}

function CategoryDialog({
  open,
  onOpenChange,
  onSubmit,
  isLoading,
  initialValues,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CategoryFormValues) => void;
  isLoading: boolean;
  initialValues?: any;
}) {
  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: initialValues || {
      name: "",
      slug: "",
      description: "",
      color: "#3B82F6",
      icon: "tag",
      glAccountCode: "",
    },
  });

  // Auto-generate slug from name
  const handleNameChange = (name: string) => {
    if (!initialValues) {
      const slug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
      form.setValue("slug", slug);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {initialValues ? "Edit Category" : "Create Category"}
          </DialogTitle>
          <DialogDescription>
            {initialValues
              ? "Update the category details below"
              : "Add a new spend category for classification"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="e.g., Professional Services"
                        onChange={(e) => {
                          field.onChange(e);
                          handleNameChange(e.target.value);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Slug</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g., prof-services" />
                    </FormControl>
                    <FormDescription className="text-xs">
                      Unique identifier (lowercase, hyphens)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="What does this category cover?"
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="color"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Color</FormLabel>
                    <div className="flex gap-2">
                      <FormControl>
                        <Input {...field} type="color" className="w-20 h-10" />
                      </FormControl>
                      <FormControl>
                        <Input {...field} placeholder="#3B82F6" className="flex-1" />
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="glAccountCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>GL Account Code</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g., 6100" />
                    </FormControl>
                    <FormDescription className="text-xs">
                      For accounting system sync
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : initialValues ? (
                  "Update Category"
                ) : (
                  "Create Category"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
