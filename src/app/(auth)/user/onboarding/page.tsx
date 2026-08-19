"use client";

import { Suspense, useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import axios from "axios";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/toast/use-toast";
import { usePageTracking } from "@/hooks/analytics";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import useGetAllCategory from "@/hooks/category/useGetAllCategory";
import useUpdateInterests from "@/hooks/customer/useUpdateInterests";

const MIN_INTERESTS = 3;

const formSchema = z.object({
  fullName: z.string().min(2, {
    message: "Full name must be at least 2 characters.",
  }),
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
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [step, setStep] = useState<1 | 2>(1);
  const [saving, setSaving] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);

  const { categories, loading: categoriesLoading } = useGetAllCategory();
  const { updateInterests } = useUpdateInterests();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      phoneNumber: "",
      username: "",
    },
  });

  const authHeader = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setSaving(true);
    try {
      // upload the avatar first — the backend stores profilePic as a URL string
      let profilePicUrl = "";
      if (values.profilePic) {
        const fd = new FormData();
        fd.append("files", values.profilePic);
        const upload = await axios.post(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/customer/profile/upload/images`,
          fd,
          { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
        );
        profilePicUrl = upload.data?.[0]?.url ?? "";
      }

      await axios.patch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/customer/profile/update-profile`,
        {
          name: values.fullName,
          username: values.username,
          phoneNumber: values.phoneNumber,
          profilePic: profilePicUrl,
        },
        { headers: authHeader() }
      );

      setStep(2);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  }

  const toggleInterest = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  async function onSubmitInterests() {
    if (selected.length < MIN_INTERESTS) return;
    setSaving(true);
    const result = await updateInterests(selected);
    setSaving(false);

    if (!result.success) {
      toast({
        title: "Error",
        description: "Could not save your interests. Please try again.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "You're all set",
      description: "We'll use these to personalise what you see.",
    });
    router.push("/");
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setAvatarUrl(imageUrl);
      form.setValue("profilePic", file);
    }
  };

  return (
    <div className='container mx-auto py-10'>
      <Card className='max-w-md mx-auto'>
        <CardHeader>
          <CardTitle>
            {step === 1 ? "Complete Your Profile" : "What are you into?"}
          </CardTitle>
          <p className='text-sm text-muted-foreground'>Step {step} of 2</p>
        </CardHeader>
        <CardContent>
          {step === 1 ? (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
                <div className='flex justify-center'>
                  <Avatar className='w-32 h-32'>
                    <AvatarImage src={avatarUrl || ""} alt='Profile picture' />
                    <AvatarFallback>UP</AvatarFallback>
                  </Avatar>
                </div>
                <div>
                  <Input
                    type='file'
                    accept='image/*'
                    onChange={handleFileChange}
                    className='hidden'
                    id='profilePic'
                  />
                  <Button
                    type='button'
                    variant='outline'
                    onClick={() => document.getElementById("profilePic")?.click()}
                  >
                    Upload Profile Picture
                  </Button>
                </div>
                <FormField
                  control={form.control}
                  name='fullName'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder='John Doe' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='phoneNumber'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input placeholder='+1234567890' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='username'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input placeholder='johndoe' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type='submit' className='w-full' disabled={saving}>
                  {saving ? "Saving..." : "Continue"}
                </Button>
              </form>
            </Form>
          ) : (
            <div className='space-y-6'>
              <p className='text-sm text-muted-foreground'>
                Pick at least {MIN_INTERESTS} so we can show you the right
                products from the start.
              </p>

              {categoriesLoading ? (
                <p className='text-sm text-muted-foreground'>
                  Loading categories...
                </p>
              ) : (
                <div className='grid grid-cols-2 gap-3'>
                  {categories.map((category) => {
                    const isSelected = selected.includes(category.id);
                    return (
                      <button
                        key={category.id}
                        type='button'
                        onClick={() => toggleInterest(category.id)}
                        aria-pressed={isSelected}
                        className={`rounded-lg border p-3 text-sm text-left transition-colors ${
                          isSelected
                            ? "border-primary bg-primary/10 font-medium"
                            : "border-input hover:bg-accent"
                        }`}
                      >
                        {category.name}
                      </button>
                    );
                  })}
                </div>
              )}

              <div className='space-y-2'>
                <p className='text-xs text-muted-foreground'>
                  {selected.length} selected
                  {selected.length < MIN_INTERESTS &&
                    ` — pick ${MIN_INTERESTS - selected.length} more`}
                </p>
                <Button
                  type='button'
                  className='w-full'
                  disabled={selected.length < MIN_INTERESTS || saving}
                  onClick={onSubmitInterests}
                >
                  {saving ? "Saving..." : "Finish"}
                </Button>
              </div>
            </div>
          )}
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
