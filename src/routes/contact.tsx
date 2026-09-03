import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, Send } from "lucide-react";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { contactSchema, submitContactForm, type ContactFormData } from "@/lib/contact.functions";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Apex Grand Prix — F1 Ticket Support" },
      {
        name: "description",
        content:
          "Get in touch with Apex Grand Prix ticket support for questions about 2027 Formula 1 season bookings, grandstands, and extras.",
      },
      { property: "og:title", content: "Contact Apex Grand Prix — F1 Ticket Support" },
      {
        property: "og:description",
        content: "Reach our ticket support team for help with your 2027 F1 booking.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ContactPage,
});

const subjects = [
  { value: "booking", label: "Booking question" },
  { value: "seats", label: "Seat selection help" },
  { value: "extras", label: "Paddock extras" },
  { value: "refund", label: "Refund or date change" },
  { value: "other", label: "Something else" },
];

function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const send = useServerFn(submitContactForm);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: "", email: "", subject: "", message: "" },
  });

  const onSubmit = async (data: ContactFormData) => {
    try {
      const result = await send({ data });
      if (result.success) {
        setSubmitted(true);
        reset();
        toast.success("Message sent — we'll reply within 24 hours.");
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    }
  };

  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="mx-auto max-w-2xl px-6 py-16 md:py-24">
        <div className="text-center">
          <h1 className="text-4xl uppercase md:text-5xl">
            Contact <span className="text-speed">support</span>
          </h1>
          <p className="mt-4 text-muted-foreground">
            Questions about your booking, seat selection, or paddock extras? We're here to help.
          </p>
        </div>

        {submitted ? (
          <div className="mt-12 rounded-lg border border-border bg-card p-8 text-center">
            <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-primary/10">
              <Check className="size-8 text-primary" />
            </div>
            <h2 className="mt-6 text-2xl uppercase">Message sent</h2>
            <p className="mt-2 text-muted-foreground">
              Thanks for reaching out. Our ticket team will get back to you within 24 hours.
            </p>
            <Button asChild className="mt-6">
              <Link to="/">Back to booking</Link>
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="mt-12 space-y-6" noValidate>
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" placeholder="Lewis Hamilton" {...register("name")} />
              {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                {...register("email")}
              />
              {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Controller
                name="subject"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger id="subject">
                      <SelectValue placeholder="Select a topic" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.map((s) => (
                        <SelectItem key={s.value} value={s.value}>
                          {s.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.subject && (
                <p className="text-sm text-destructive">{errors.subject.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                rows={5}
                placeholder="How can we help?"
                {...register("message")}
              />
              {errors.message && (
                <p className="text-sm text-destructive">{errors.message.message}</p>
              )}
            </div>

            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? "Sending..." : "Send message"}
              <Send className="size-4" />
            </Button>
          </form>
        )}
      </section>
    </main>
  );
}
