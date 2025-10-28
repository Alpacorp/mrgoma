export interface FooterLink {
  label: string
  href: string
  external?: boolean
}

export interface FooterSection {
  title: string
  links: FooterLink[]
}

export interface SocialLink {
  platform: string
  href: string
  icon: "instagram" | "facebook" | "twitter" | "linkedin" | "x" | "tiktok"
}

export interface FooterProps {
  className?: string
  sections?: FooterSection[]
  socialLinks?: SocialLink[]
  copyrightYear?: number
  companyName?: string
}
