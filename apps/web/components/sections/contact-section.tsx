"use client"

import { useState } from "react"
import {
  Mail,
  MapPin,
  Phone,
  Send,
  Loader2,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Clock,
  Globe,
} from "lucide-react"
import { Github, Linkedin, Twitter } from "@/components/brand-icons"
import { Card, CardContent, CardHeader, CardTitle } from "@portfolio/ui/card"
import { Button } from "@portfolio/ui/button"
import { Input } from "@portfolio/ui/input"
import { Textarea } from "@portfolio/ui/textarea"
import { Label } from "@portfolio/ui/label"
import { Badge } from "@portfolio/ui/badge"

// Contact information
const contactInfo = [
  {
    icon: Mail,
    title: "Email",
    value: "rahul@rapidtechplus.com",
    href: "mailto:rahul@rapidtechplus.com",
    description: "Send me an email anytime",
  },
  {
    icon: Phone,
    title: "Phone",
    value: "+91-8264110143",
    href: "tel:+918264110143",
    description: "Available Mon-Fri, 10AM-7PM IST",
  },
  {
    icon: MapPin,
    title: "Location",
    value: "Ahmedabad, India",
    href: "https://maps.google.com/?q=Ahmedabad,India",
    description: "Gujarat, India",
  },
  {
    icon: Clock,
    title: "Timezone",
    value: "IST (UTC+5:30)",
    href: null,
    description: "Indian Standard Time",
  },
]

// Social links
const socialLinks = [
  {
    name: "GitHub",
    icon: Github,
    href: "https://github.com",
    color: "hover:bg-gray-800 hover:text-white",
    username: "@rahul",
  },
  {
    name: "LinkedIn",
    icon: Linkedin,
    href: "https://linkedin.com",
    color: "hover:bg-blue-600 hover:text-white",
    username: "in/rahul",
  },
  {
    name: "Twitter",
    icon: Twitter,
    href: "https://twitter.com",
    color: "hover:bg-sky-500 hover:text-white",
    username: "@rahul",
  },
]

interface ContactFormData {
  name: string
  email: string
  message: string
}

type ContactFormField = keyof ContactFormData
type ContactFormErrors = Partial<Record<ContactFormField, string>>
type ContactFormTouched = Partial<Record<ContactFormField, boolean>>
type SubmitStatus = "success" | "error" | "rate-limited" | null

// Form validation
const validateForm = (data: ContactFormData): ContactFormErrors => {
  const errors: ContactFormErrors = {}

  // Name validation
  if (!data.name.trim()) {
    errors.name = "Name is required"
  } else if (data.name.trim().length < 2) {
    errors.name = "Name must be at least 2 characters"
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!data.email.trim()) {
    errors.email = "Email is required"
  } else if (!emailRegex.test(data.email)) {
    errors.email = "Please enter a valid email address"
  }

  // Message validation
  if (!data.message.trim()) {
    errors.message = "Message is required"
  } else if (data.message.trim().length < 10) {
    errors.message = "Message must be at least 10 characters"
  }

  return errors
}

export function ContactSection() {
  const [formData, setFormData] = useState<ContactFormData>({
    name: "",
    email: "",
    message: "",
  })
  const [errors, setErrors] = useState<ContactFormErrors>({})
  const [touched, setTouched] = useState<ContactFormTouched>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>(null)

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target as { name: ContactFormField; value: string }
    setFormData((prev) => ({ ...prev, [name]: value }))
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name } = e.target as { name: ContactFormField }
    setTouched((prev) => ({ ...prev, [name]: true }))
    
    // Validate on blur
    const validationErrors = validateForm(formData)
    if (validationErrors[name]) {
      setErrors((prev) => ({ ...prev, [name]: validationErrors[name] }))
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    // Validate all fields
    const validationErrors = validateForm(formData)
    setErrors(validationErrors)
    setTouched({ name: true, email: true, message: true })

    // If there are errors, don't submit
    if (Object.keys(validationErrors).length > 0) {
      return
    }

    setIsSubmitting(true)
    setSubmitStatus(null)

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        if (response.status === 429) {
          setSubmitStatus("rate-limited")
          return
        }

        // The server re-runs the same validation; surface its field errors when it sends them.
        const payload: unknown = await response.json().catch(() => null)
        const serverErrors =
          payload && typeof payload === "object" && "errors" in payload
            ? (payload as { errors: ContactFormErrors }).errors
            : null

        if (serverErrors) {
          setErrors(serverErrors)
        }
        setSubmitStatus("error")
        return
      }

      setSubmitStatus("success")
      setFormData({ name: "", email: "", message: "" })
      setTouched({})

      // Reset success message after 10 seconds
      setTimeout(() => setSubmitStatus(null), 10000)
    } catch {
      setSubmitStatus("error")
    } finally {
      setIsSubmitting(false)
    }
  }

  const getInputClassName = (fieldName: ContactFormField) => {
    const baseClass = "transition-colors"
    if (touched[fieldName] && errors[fieldName]) {
      return `${baseClass} border-red-500 focus-visible:ring-red-500`
    }
    if (touched[fieldName] && !errors[fieldName] && formData[fieldName]) {
      return `${baseClass} border-green-500 focus-visible:ring-green-500`
    }
    return baseClass
  }

  return (
    <section id="contact" className="py-20 md:py-32">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Section header */}
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 px-4 py-1">
              <span className="text-primary">Get In Touch</span>
            </Badge>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mt-2">
              Let's <span className="text-gradient">Connect</span>
            </h2>
            <p className="text-muted-foreground mt-4 max-w-2xl mx-auto text-lg">
              Have a project in mind or want to discuss opportunities? 
              I'd love to hear from you. Let's create something amazing together!
            </p>
          </div>

          <div className="grid lg:grid-cols-5 gap-8">
            {/* Contact Info - Left Side */}
            <div className="lg:col-span-2 space-y-6">
              {/* Contact Cards */}
              <div className="space-y-4">
                {contactInfo.map((info, index) => (
                  <Card key={index} className="group hover:border-primary transition-all duration-300 hover:shadow-md">
                    <CardContent className="p-4 flex items-start gap-4">
                      <div className="p-3 rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                        <info.icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-muted-foreground">{info.title}</p>
                        {info.href ? (
                          <a
                            href={info.href}
                            target={info.href.startsWith("http") ? "_blank" : undefined}
                            rel={info.href.startsWith("http") ? "noopener noreferrer" : undefined}
                            className="font-semibold hover:text-primary transition-colors"
                          >
                            {info.value}
                          </a>
                        ) : (
                          <p className="font-semibold">{info.value}</p>
                        )}
                        <p className="text-xs text-muted-foreground mt-0.5">{info.description}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Social Links */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Globe className="h-5 w-5 text-primary" />
                    Connect on Social
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex flex-wrap gap-3">
                    {socialLinks.map((social, index) => (
                      <a
                        key={index}
                        href={social.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`flex items-center gap-2 px-4 py-2 rounded-full bg-secondary transition-all duration-300 hover:scale-105 ${social.color}`}
                        aria-label={social.name}
                      >
                        <social.icon className="h-5 w-5" />
                        <span className="text-sm font-medium">{social.name}</span>
                      </a>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Availability Card */}
              <Card className="bg-linear-to-br from-primary/5 to-purple-500/5 border-primary/20">
                <CardContent className="p-6">
                  <div className="flex items-start gap-3">
                    <div className="relative">
                      <MessageSquare className="h-8 w-8 text-primary" />
                      <span className="absolute -top-1 -right-1 flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Available for Work</h3>
                      <p className="text-sm text-muted-foreground">
                        I'm currently open to freelance projects, consulting, 
                        and full-time opportunities. Let's discuss how I can help!
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Contact Form - Right Side */}
            <div className="lg:col-span-3">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Send className="h-5 w-5 text-primary" />
                    Send a Message
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Success Message */}
                  {submitStatus === "success" && (
                    <div className="mb-6 p-4 rounded-lg bg-green-500/10 border border-green-500/20 flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-green-600 dark:text-green-400">
                          Message sent successfully!
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Thank you for reaching out. I'll get back to you within 24-48 hours.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Rate Limited Message */}
                  {submitStatus === "rate-limited" && (
                    <div className="mb-6 p-4 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-amber-600 dark:text-amber-400">
                          Too many messages
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          You&apos;ve sent several messages already. Please try again later, or
                          email me directly at rahul@rapidtechplus.com
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Error Message */}
                  {submitStatus === "error" && (
                    <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-red-600 dark:text-red-400">
                          Failed to send message
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Please try again or email me directly at rahul@rapidtechplus.com
                        </p>
                      </div>
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                    {/* Name Field */}
                    <div className="space-y-2">
                      <Label htmlFor="name" className="flex items-center gap-1">
                        Name
                        <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="name"
                        name="name"
                        type="text"
                        placeholder="Your full name"
                        value={formData.name}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={getInputClassName("name")}
                        aria-invalid={touched.name && errors.name ? "true" : "false"}
                        aria-describedby={errors.name ? "name-error" : undefined}
                        disabled={isSubmitting}
                      />
                      {touched.name && errors.name && (
                        <p id="name-error" className="text-sm text-red-500 flex items-center gap-1">
                          <AlertCircle className="h-4 w-4" />
                          {errors.name}
                        </p>
                      )}
                    </div>

                    {/* Email Field */}
                    <div className="space-y-2">
                      <Label htmlFor="email" className="flex items-center gap-1">
                        Email
                        <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="your@email.com"
                        value={formData.email}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={getInputClassName("email")}
                        aria-invalid={touched.email && errors.email ? "true" : "false"}
                        aria-describedby={errors.email ? "email-error" : undefined}
                        disabled={isSubmitting}
                      />
                      {touched.email && errors.email && (
                        <p id="email-error" className="text-sm text-red-500 flex items-center gap-1">
                          <AlertCircle className="h-4 w-4" />
                          {errors.email}
                        </p>
                      )}
                    </div>

                    {/* Message Field */}
                    <div className="space-y-2">
                      <Label htmlFor="message" className="flex items-center gap-1">
                        Message
                        <span className="text-red-500">*</span>
                      </Label>
                      <Textarea
                        id="message"
                        name="message"
                        placeholder="Tell me about your project, idea, or just say hi..."
                        rows={6}
                        value={formData.message}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={`resize-none ${getInputClassName("message")}`}
                        aria-invalid={touched.message && errors.message ? "true" : "false"}
                        aria-describedby={errors.message ? "message-error" : undefined}
                        disabled={isSubmitting}
                      />
                      <div className="flex justify-between items-center">
                        {touched.message && errors.message ? (
                          <p id="message-error" className="text-sm text-red-500 flex items-center gap-1">
                            <AlertCircle className="h-4 w-4" />
                            {errors.message}
                          </p>
                        ) : (
                          <span />
                        )}
                        <span className="text-xs text-muted-foreground">
                          {formData.message.length} / 1000
                        </span>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <Button 
                      type="submit" 
                      size="lg" 
                      className="w-full"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                          Sending Message...
                        </>
                      ) : (
                        <>
                          <Send className="h-5 w-5 mr-2" />
                          Send Message
                        </>
                      )}
                    </Button>

                    {/* Privacy note */}
                    <p className="text-xs text-muted-foreground text-center">
                      By submitting this form, you agree to be contacted regarding your inquiry.
                      Your information will never be shared with third parties.
                    </p>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Map or Additional CTA */}
          <div className="mt-16">
            <Card className="overflow-hidden">
              <div className="grid md:grid-cols-2">
                {/* Map placeholder */}
                <div className="relative h-64 md:h-auto bg-secondary">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <MapPin className="h-12 w-12 text-primary mx-auto mb-4" />
                      <h3 className="font-semibold text-lg">Ahmedabad, Gujarat</h3>
                      <p className="text-muted-foreground">India</p>
                      <Button variant="outline" size="sm" className="mt-4" asChild>
                        <a 
                          href="https://maps.google.com/?q=Ahmedabad,India" 
                          target="_blank" 
                          rel="noopener noreferrer"
                        >
                          View on Google Maps
                        </a>
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Quick contact info */}
                <CardContent className="p-8 flex flex-col justify-center">
                  <h3 className="text-2xl font-bold mb-4">Let's Work Together</h3>
                  <p className="text-muted-foreground mb-6">
                    Whether you have a project in mind, need technical consultation, 
                    or just want to say hello, I'm always happy to connect with 
                    fellow developers and potential collaborators.
                  </p>
                  <div className="space-y-3">
                    <a 
                      href="mailto:rahul@rapidtechplus.com"
                      className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-colors"
                    >
                      <Mail className="h-5 w-5" />
                      <span>rahul@rapidtechplus.com</span>
                    </a>
                    <a 
                      href="tel:+918264110143"
                      className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-colors"
                    >
                      <Phone className="h-5 w-5" />
                      <span>+91-8264110143</span>
                    </a>
                  </div>
                </CardContent>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </section>
  )
}
