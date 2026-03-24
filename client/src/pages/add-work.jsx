import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { useStore } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";
import { createWork } from "@/lib/api";
import { X, Plus, Briefcase, ImagePlus } from "lucide-react";

const categories = [
  "Web Development",
  "App Development",
  "UI/UX Design",
  "Graphic Design",
  "Content Writing",
  "Video Editing",
  "Marketing",
  "Data Entry",
  "Other",
];

const addWorkSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  category: z.string().min(1, "Please select a category"),
  shortDescription: z
    .string()
    .min(10, "Short description must be at least 10 characters"),
  detailedDescription: z
    .string()
    .min(20, "Detailed description must be at least 20 characters"),
  budget: z
    .string()
    .min(1, "Budget is required")
    .refine((v) => Number(v) > 0, "Must be positive"),
  deadline: z.string().min(1, "Deadline is required"),
  projectLevel: z.enum(["easy", "medium", "hard"]),
  workType: z.enum(["remote", "onsite", "hybrid"]),
  location: z.string().optional(),
});

export default function AddWork() {
  const [, setLocation] = useLocation();
  const { currentUser } = useStore();
  const { toast } = useToast();

  const [skillInput, setSkillInput] = useState("");
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  const form = useForm({
    resolver: zodResolver(addWorkSchema),
    defaultValues: {
      title: "",
      category: "",
      shortDescription: "",
      detailedDescription: "",
      budget: "",
      deadline: "",
      projectLevel: "medium",
      workType: "remote",
      location: "",
    },
  });

  const addSkill = () => {
    const skill = skillInput.trim();
    if (skill && !skills.includes(skill)) {
      setSkills([...skills, skill]);
      setSkillInput("");
    }
  };

  const removeSkill = (skillToRemove) => {
    setSkills(skills.filter((skill) => skill !== skillToRemove));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedImage(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview("");
  };

  const onSubmit = async (values) => {
    if (!currentUser) {
      toast({
        title: "Please login first",
        variant: "destructive",
      });
      return;
    }

    if (skills.length === 0) {
      toast({
        title: "Please add at least one required skill",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("title", values.title);
      formData.append("shortDescription", values.shortDescription);
      formData.append("fullDescription", values.detailedDescription);
      formData.append("category", values.category);
      formData.append("skills", skills.join(","));
      formData.append("budget", values.budget);
      formData.append("deadline", values.deadline);
      formData.append("projectLevel", values.projectLevel);
      formData.append("workType", values.workType);
      formData.append("postedBy", currentUser.id || currentUser._id);

      if (selectedImage) {
        formData.append("image", selectedImage);
      }

      await createWork(formData);

      toast({
        title: "Work posted successfully!",
      });

      setLocation("/home");
    } catch (error) {
      toast({
        title: "Failed to post work",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 overflow-auto bg-background pb-24">
      <div className="w-full px-4 py-4 md:px-5 lg:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="mb-3 flex items-center gap-3 rounded-2xl border bg-card px-4 py-3 shadow-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <Briefcase className="h-5 w-5 text-primary" />
            </div>

            <div>
              <h1 className="text-base font-semibold tracking-tight text-foreground">
                Create Work Post
              </h1>
              <p className="text-xs text-muted-foreground">
                Add project details and publish your work post
              </p>
            </div>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
                <div className="space-y-4 xl:col-span-8">
                  <Card className="rounded-2xl border shadow-sm">
                    <CardContent className="p-4">
                      <div className="mb-3">
                        <h2 className="text-sm font-semibold text-foreground">
                          Project Details
                        </h2>
                      </div>

                      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                        <FormField
                          control={form.control}
                          name="title"
                          render={({ field }) => (
                            <FormItem className="md:col-span-2">
                              <FormLabel>Project Title *</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Build a landing page for startup"
                                  {...field}
                                  data-testid="input-title"
                                  className="h-10 rounded-lg bg-background text-foreground placeholder:text-muted-foreground"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="category"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Category *</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger
                                    className="h-10 rounded-lg bg-background text-foreground"
                                    data-testid="select-category"
                                  >
                                    <SelectValue placeholder="Select category" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {categories.map((category) => (
                                    <SelectItem key={category} value={category}>
                                      {category}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="projectLevel"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Project Level *</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger
                                    className="h-10 rounded-lg bg-background text-foreground"
                                    data-testid="select-project-level"
                                  >
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="easy">Easy</SelectItem>
                                  <SelectItem value="medium">Medium</SelectItem>
                                  <SelectItem value="hard">Hard</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="shortDescription"
                          render={({ field }) => (
                            <FormItem className="md:col-span-2">
                              <FormLabel>Short Description *</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Short one-line summary of the project"
                                  {...field}
                                  data-testid="input-short-desc"
                                  className="h-10 rounded-lg bg-background text-foreground placeholder:text-muted-foreground"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="detailedDescription"
                          render={({ field }) => (
                            <FormItem className="md:col-span-2">
                              <FormLabel>Detailed Description *</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="Describe requirements, deliverables, expectations, and important details"
                                  {...field}
                                  rows={4}
                                  data-testid="input-detailed-desc"
                                  className="resize-none rounded-xl bg-background text-foreground placeholder:text-muted-foreground"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="rounded-2xl border shadow-sm">
                    <CardContent className="p-4">
                      <div className="mb-3">
                        <h2 className="text-sm font-semibold text-foreground">
                          Work Settings
                        </h2>
                      </div>

                      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                        <FormField
                          control={form.control}
                          name="budget"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Budget ($) *</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  placeholder="1500"
                                  {...field}
                                  data-testid="input-budget"
                                  className="h-10 rounded-lg bg-background text-foreground placeholder:text-muted-foreground"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="deadline"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Deadline *</FormLabel>
                              <FormControl>
                                <Input
                                  type="date"
                                  {...field}
                                  data-testid="input-deadline"
                                  className="h-10 rounded-lg bg-background text-foreground placeholder:text-muted-foreground"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="workType"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Work Type *</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger
                                    className="h-10 rounded-lg bg-background text-foreground"
                                    data-testid="select-work-type"
                                  >
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="remote">Remote</SelectItem>
                                  <SelectItem value="onsite">On-site</SelectItem>
                                  <SelectItem value="hybrid">Hybrid</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="location"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Location</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Remote / Mumbai / Bangalore"
                                  {...field}
                                  data-testid="input-location"
                                  className="h-10 rounded-lg bg-background text-foreground placeholder:text-muted-foreground"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="rounded-2xl border shadow-sm">
                    <CardContent className="p-4">
                      <div className="mb-3">
                        <h2 className="text-sm font-semibold text-foreground">
                          Required Skills
                        </h2>
                      </div>

                      <div className="space-y-3">
                        <div className="flex gap-2">
                          <Input
                            placeholder="Add skill"
                            value={skillInput}
                            onChange={(e) => setSkillInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                addSkill();
                              }
                            }}
                            data-testid="input-skill"
                            className="h-10 rounded-lg bg-background text-foreground placeholder:text-muted-foreground"
                          />
                          <Button
                            type="button"
                            variant="secondary"
                            onClick={addSkill}
                            data-testid="button-add-skill"
                            className="h-10 rounded-lg px-4"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>

                        {skills.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {skills.map((skill) => (
                              <Badge
                                key={skill}
                                variant="secondary"
                                className="rounded-full px-3 py-1 text-xs"
                              >
                                <span className="mr-2">{skill}</span>
                                <button
                                  type="button"
                                  onClick={() => removeSkill(skill)}
                                  data-testid={`button-remove-skill-${skill}`}
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-4 xl:col-span-4">
                  <Card className="rounded-2xl border shadow-sm">
                    <CardContent className="p-4">
                      <div className="mb-3 flex items-center gap-2">
                        <ImagePlus className="h-4 w-4 text-primary" />
                        <h2 className="text-sm font-semibold text-foreground">
                          Project Image
                        </h2>
                      </div>

                      <label className="flex min-h-[110px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/20 px-3 py-4 text-center transition hover:border-primary/50 hover:bg-muted/40">
                        <ImagePlus className="mb-2 h-5 w-5 text-muted-foreground" />
                        <span className="text-sm font-medium text-foreground">
                          Upload image
                        </span>
                        <span className="text-[11px] text-muted-foreground">
                          Optional
                        </span>

                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleImageChange}
                        />
                      </label>

                      {selectedImage && (
                        <p className="mt-2 break-all text-xs text-muted-foreground">
                          {selectedImage.name}
                        </p>
                      )}

                      {imagePreview && (
                        <div className="mt-3">
                          <div className="mb-2 flex items-center justify-between">
                            <h3 className="text-xs font-medium text-foreground">
                              Preview
                            </h3>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={removeImage}
                              className="h-7 px-2 text-xs"
                            >
                              Remove
                            </Button>
                          </div>

                          <div className="overflow-hidden rounded-xl border">
                            <img
                              src={imagePreview}
                              alt="Preview"
                              className="h-[180px] w-full object-cover"
                            />
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card className="rounded-2xl border shadow-sm">
                    <CardContent className="p-4">
                      <h2 className="mb-2 text-sm font-semibold text-foreground">
                        Tips
                      </h2>
                      <div className="space-y-1.5 text-xs text-muted-foreground">
                        <p>Keep the title clear and specific.</p>
                        <p>Add the main required skills.</p>
                        <p>Use one realistic budget.</p>
                        <p>Add image only when useful.</p>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="h-10 flex-1 rounded-lg"
                      onClick={() => setLocation("/home")}
                    >
                      Cancel
                    </Button>

                    <Button
                      type="submit"
                      className="h-10 flex-1 rounded-lg"
                      disabled={loading}
                      data-testid="button-post-work"
                    >
                      {loading ? "Posting..." : "Post"}
                    </Button>
                  </div>
                </div>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}