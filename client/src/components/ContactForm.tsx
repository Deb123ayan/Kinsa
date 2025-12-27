import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { submitContactQuery } from '@/services/contact'
import { useToast } from '@/hooks/use-toast'

const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  subject: z.string().min(5, 'Subject must be at least 5 characters'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
})

type ContactForm = z.infer<typeof contactSchema>

export function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactForm>({
    resolver: zodResolver(contactSchema),
  })

  const onSubmit = async (data: ContactForm) => {
    setIsSubmitting(true)
    
    try {
      const result = await submitContactQuery(data);

      if (result.success) {
        toast({
          title: "Message sent successfully!",
          description: "We'll get back to you as soon as possible.",
        })
        reset()
      } else {
        toast({
          title: "Failed to send message",
          description: result.error || "Please try again or contact us directly.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Error submitting contact form:', error)
      toast({
        title: "Failed to send message",
        description: "Please try again or contact us directly.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="text-2xl font-serif text-primary">Contact Our Team</CardTitle>
        <p className="text-muted-foreground">
          Get in touch with our export specialists for personalized assistance.
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            {...register('name')}
            placeholder="Your name"
            className={errors.name ? 'border-red-500' : ''}
          />
          {errors.name && (
            <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            {...register('email')}
            placeholder="your.email@example.com"
            className={errors.email ? 'border-red-500' : ''}
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="subject">Subject</Label>
          <Input
            id="subject"
            {...register('subject')}
            placeholder="What is this about?"
            className={errors.subject ? 'border-red-500' : ''}
          />
          {errors.subject && (
            <p className="text-red-500 text-sm mt-1">{errors.subject.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="message">Message</Label>
          <Textarea
            id="message"
            {...register('message')}
            placeholder="Your message..."
            rows={4}
            className={errors.message ? 'border-red-500' : ''}
          />
          {errors.message && (
            <p className="text-red-500 text-sm mt-1">{errors.message.message}</p>
          )}
        </div>

        <Button 
          type="submit" 
          className="w-full bg-accent hover:bg-accent/90 text-white"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Sending...' : 'Send Message'}
        </Button>
      </form>
      </CardContent>
    </Card>
  )
}