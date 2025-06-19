"use client";

import { Suspense, useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/toast/use-toast";
import { usePageTracking } from "@/hooks/analytics";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { useAuth } from "@/context/AuthContext";
import { Upload, X } from "lucide-react";

const formSchema = z.object({
  phoneNumber: z.string().min(10, {
    message: "Phone number must be at least 10 characters.",
  }),
  username: z.string().min(3, {
    message: "Username must be at least 3 characters.",
  }),
  profilePic: z.instanceof(File).optional(),
});

function OnboardingPageContent() {
  const router = useRouter();
  usePageTracking();
  const { toast } = useToast();
  const { user, uploadProfilePicture, updateUser, loading } = useAuth();

  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user?.profilePic) {
      setAvatarUrl(user.profilePic);
    }
  }, [user]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      phoneNumber: "",
      username: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      // await uploadProfilePicture(values.profilePic as File);
      await updateUser({
        username: values.username,
        phoneNumber: values.phoneNumber,
      });
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      });

      router.push("/");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    }
  }

  async function uploadProfilePic(file: File) {
    try {
      if (!file) return;
      console.log(file);
      await uploadProfilePicture(file);
      // const imageUrl = URL.createObjectURL(file);
      // setAvatarUrl(imageUrl);
      // form.setValue("profilePic", file);

      toast({
        title: "Profile picture uploaded",
        description: "Your profile picture has been successfully updated.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload profile picture. Please try again.",
        variant: "destructive",
      });
    }
  }

  const handleFileChange = (file: File) => {
    if (file && file.type.startsWith("image/")) {
      const imageUrl = URL.createObjectURL(file);
      setAvatarUrl(imageUrl);
      form.setValue("profilePic", file);
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileChange(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileChange(file);
    }
  };

  const handleBoxClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setAvatarUrl(null);
    form.setValue("profilePic", undefined);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Complete Your Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="flex justify-center">
                <div
                  className={`relative w-32 h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                    isDragOver
                      ? "border-primary bg-primary/10"
                      : avatarUrl
                      ? "border-gray-300"
                      : "border-gray-400 hover:border-primary hover:bg-gray-50"
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={handleBoxClick}>

                  {avatarUrl ? (
                    <>
                      <img
                        src={avatarUrl}
                        alt="Profile picture"
                        className="w-full h-full object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors">
                        <X size={16} />
                      </button>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-500">
                      <Upload size={24} className="mb-2" />
                      <p className="text-sm text-center px-2">
                        {isDragOver
                          ? "Drop image here"
                          : "Drag & drop or click to upload"}
                      </p>
                    </div>
                  )}
                </div>
              </div>
              <Input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleInputChange}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => {
                  // Trigger file explorer
                  fileInputRef.current?.click();
                }}
                disabled={loading}>
                {loading
                  ? "Uploading..."
                  : avatarUrl
                  ? "Change Profile Picture"
                  : "Upload Profile Picture"}
              </Button>

              <Input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={async (event) => {
                  const file = event.target.files?.[0];
                  if (file && file.type.startsWith("image/")) {
                    const previousAvatar = avatarUrl; // Store current avatar in case of error
                    const newImageUrl = URL.createObjectURL(file);

                    setAvatarUrl(newImageUrl); // Show new image preview immediately
                    form.setValue("profilePic", file);

                    try {
                      await uploadProfilePic(file);
                    } catch (err) {
                      // Revert to previous image if upload fails
                      setAvatarUrl(previousAvatar || null);
                      toast({
                        title: "Upload failed",
                        description:
                          "Could not upload profile picture. Please try again.",
                        variant: "destructive",
                      });
                    }
                  }
                }}
                className="hidden"
              />
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input placeholder="johndoe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input placeholder="+1234567890" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full">
                Submit
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <OnboardingPageContent />
    </Suspense>
  );
}
