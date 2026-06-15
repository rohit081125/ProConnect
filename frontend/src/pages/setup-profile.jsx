import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, UserCircle, X, Loader2, Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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
import { updateUserProfile, uploadProfileImage } from "../lib/api";

const setupSchema = z.object({
  bio: z.string().min(10, "Bio must be at least 10 characters"),
  location: z.string().min(2, "Location is required"),
});

export default function SetupProfile() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const store = useStore();

  const [skillInput, setSkillInput] = useState("");
  const [skills, setSkills] = useState([]);
  const [portfolioInput, setPortfolioInput] = useState("");
  const [portfolioLinks, setPortfolioLinks] = useState([]);
  const [socialInput, setSocialInput] = useState("");
  const [socialLinks, setSocialLinks] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [loading, setLoading] = useState(false);

  const currentUser = store.currentUser;
  const userId =
    currentUser?._id ||
    currentUser?.id ||
    currentUser?.userId ||
    localStorage.getItem("userId") ||
    "";

  const form = useForm({
    resolver: zodResolver(setupSchema),
    defaultValues: {
      bio: "",
      location: "",
    },
  });

  useEffect(() => {
    const savedUser = currentUser || JSON.parse(localStorage.getItem("user") || "null");

    if (savedUser) {
      form.reset({
        bio: savedUser.bio || "",
        location: savedUser.location || "",
      });

      setSkills(Array.isArray(savedUser.skills) ? savedUser.skills : []);
      setPortfolioLinks(
        Array.isArray(savedUser.portfolioLinks) ? savedUser.portfolioLinks : []
      );
      setSocialLinks(
        Array.isArray(savedUser.socialLinks) ? savedUser.socialLinks : []
      );
      setImagePreview(savedUser.profileImage || "");
    }
  }, [currentUser, form]);

  const addSkill = () => {
    const value = skillInput.trim();
    if (!value) return;
    if (skills.includes(value)) return;

    setSkills((prev) => [...prev, value]);
    setSkillInput("");
  };

  const addPortfolioLink = () => {
    const value = portfolioInput.trim();
    if (!value) return;

    setPortfolioLinks((prev) => [...prev, value]);
    setPortfolioInput("");
  };

  const addSocialLink = () => {
    const value = socialInput.trim();
    if (!value) return;

    setSocialLinks((prev) => [...prev, value]);
    setSocialInput("");
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file",
        description: "Please select an image file only.",
        variant: "destructive",
      });
      return;
    }

    setSelectedImage(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const onSubmit = async (values) => {
    if (!userId) {
      toast({
        title: "User not found",
        description: "Please log in again.",
        variant: "destructive",
      });
      setLocation("/login");
      return;
    }

    if (skills.length === 0) {
      toast({
        title: "Please add at least one skill",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const payload = {
        name: currentUser?.name || "",
        email: currentUser?.email || "",
        bio: values.bio,
        location: values.location,
        skills,
        portfolioLinks,
        socialLinks,
        education: currentUser?.education || "",
        experience: currentUser?.experience || "",
      };

      const profileResponse = await updateUserProfile(userId, payload);

      let updatedUser =
        profileResponse.user ||
        profileResponse.data ||
        profileResponse.profile ||
        profileResponse ||
        {
          ...currentUser,
          ...payload,
          userId,
          id: userId,
          _id: userId,
        };

      if (selectedImage) {
        const imageResponse = await uploadProfileImage(userId, selectedImage);

        updatedUser =
          imageResponse.user ||
          imageResponse.data ||
          imageResponse.profile ||
          imageResponse ||
          {
            ...updatedUser,
            profileImage: updatedUser.profileImage,
          };
      }

      localStorage.setItem("user", JSON.stringify(updatedUser));
      localStorage.setItem("userId", userId);
      localStorage.setItem("isAuthenticated", "true");

      if (typeof store.setUser === "function") {
        store.setUser(updatedUser);
      }

      if (typeof store.setIsAuthenticated === "function") {
        store.setIsAuthenticated(true);
      }

      toast({
        title: "Profile saved",
        description: "Welcome to ProConnect",
      });

      setLocation("/home");
    } catch (error) {
      toast({
        title: "Failed to save profile",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
        <div className="flex h-14 items-center justify-center px-4">
          <span className="text-xl font-bold text-primary">Pro</span>
          <span className="text-xl font-bold text-accent">Connect</span>
        </div>
      </header>

      <div className="flex-1 flex items-start justify-center px-4 py-8">
        <Card className="w-full max-w-lg overflow-visible border shadow-lg">
          <CardContent className="p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3 overflow-hidden">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Profile preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <UserCircle className="h-8 w-8 text-primary" />
                )}
              </div>

              <h1
                className="text-xl font-semibold"
                data-testid="text-setup-title"
              >
                Set Up Your Profile
              </h1>

              <p className="text-sm text-muted-foreground mt-1">
                Tell us about yourself so others can find you
              </p>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <FormLabel>Profile Image</FormLabel>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    data-testid="input-profile-image"
                  />
                  <p className="text-xs text-muted-foreground">
                    Upload a profile photo to show on your profile and navbar
                  </p>
                </div>

                <FormField
                  control={form.control}
                  name="bio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bio</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Tell us about your expertise and experience..."
                          rows={3}
                          {...field}
                          data-testid="input-bio"
                        />
                      </FormControl>
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
                          placeholder="Mumbai, India"
                          {...field}
                          data-testid="input-location"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-1.5">
                  <FormLabel>Skills</FormLabel>

                  <div className="flex gap-2">
                    <Input
                      placeholder="Add a skill..."
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addSkill();
                        }
                      }}
                      data-testid="input-skill"
                    />
                    <Button
                      type="button"
                      size="icon"
                      variant="secondary"
                      onClick={addSkill}
                      data-testid="button-add-skill"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  {skills.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {skills.map((skill) => (
                        <Badge
                          key={skill}
                          variant="secondary"
                          className="gap-1"
                        >
                          {skill}
                          <button
                            type="button"
                            onClick={() =>
                              setSkills((prev) =>
                                prev.filter((item) => item !== skill)
                              )
                            }
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-1.5">
                  <FormLabel>Portfolio Links</FormLabel>

                  <div className="flex gap-2">
                    <Input
                      placeholder="https://yourportfolio.com"
                      value={portfolioInput}
                      onChange={(e) => setPortfolioInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addPortfolioLink();
                        }
                      }}
                      data-testid="input-portfolio"
                    />
                    <Button
                      type="button"
                      size="icon"
                      variant="secondary"
                      onClick={addPortfolioLink}
                      data-testid="button-add-portfolio"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  {portfolioLinks.length > 0 && (
                    <div className="space-y-1 mt-2">
                      {portfolioLinks.map((link, index) => (
                        <div
                          key={`${link}-${index}`}
                          className="flex items-center justify-between text-sm bg-muted px-3 py-1.5 rounded-md"
                        >
                          <span className="truncate text-muted-foreground">
                            {link}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              setPortfolioLinks((prev) =>
                                prev.filter((_, idx) => idx !== index)
                              )
                            }
                          >
                            <X className="h-3 w-3 text-muted-foreground" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-1.5">
                  <FormLabel>Social Links</FormLabel>

                  <div className="flex gap-2">
                    <Input
                      placeholder="https://linkedin.com/in/yourprofile"
                      value={socialInput}
                      onChange={(e) => setSocialInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addSocialLink();
                        }
                      }}
                    />
                    <Button
                      type="button"
                      size="icon"
                      variant="secondary"
                      onClick={addSocialLink}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  {socialLinks.length > 0 && (
                    <div className="space-y-1 mt-2">
                      {socialLinks.map((link, index) => (
                        <div
                          key={`${link}-${index}`}
                          className="flex items-center justify-between text-sm bg-muted px-3 py-1.5 rounded-md"
                        >
                          <span className="truncate text-muted-foreground">
                            {link}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              setSocialLinks((prev) =>
                                prev.filter((_, idx) => idx !== index)
                              )
                            }
                          >
                            <X className="h-3 w-3 text-muted-foreground" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={loading}
                  data-testid="button-save-profile"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving...
                    </span>
                  ) : (
                    "Save and Continue"
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}