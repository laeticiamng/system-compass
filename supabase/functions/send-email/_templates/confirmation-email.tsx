import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
  Hr,
} from 'https://esm.sh/@react-email/components@0.0.22'
import * as React from 'https://esm.sh/react@18.3.1'

interface ConfirmationEmailProps {
  supabase_url: string
  email_action_type: string
  redirect_to: string
  token_hash: string
  token: string
}

export const ConfirmationEmail = ({
  token,
  supabase_url,
  email_action_type,
  redirect_to,
  token_hash,
}: ConfirmationEmailProps) => (
  <Html>
    <Head />
    <Preview>Bienvenue sur Pyramid Compass 🧭 - Confirmez votre inscription</Preview>
    <Body style={main}>
      <Container style={container}>
        {/* Logo */}
        <Section style={logoSection}>
          <Img
            src="https://abysiagseykztutnbjtu.supabase.co/storage/v1/object/public/email-assets/logo-192.png?v=1"
            alt="Pyramid Compass Logo"
            width="80"
            height="80"
            style={logo}
          />
        </Section>

        {/* Header */}
        <Heading style={h1}>Bienvenue sur Pyramid Compass 🧭</Heading>
        
        <Text style={text}>
          Merci de rejoindre notre communauté d'expatriés stratégiques ! Vous êtes à un clic de découvrir votre destination idéale.
        </Text>

        {/* Confirmation Button */}
        <Section style={buttonSection}>
          <Link
            href={`${supabase_url}/auth/v1/verify?token=${token_hash}&type=${email_action_type}&redirect_to=${redirect_to}`}
            target="_blank"
            style={button}
          >
            ✨ Confirmer mon inscription
          </Link>
        </Section>

        <Text style={textMuted}>
          Ou copiez ce code de confirmation : <code style={code}>{token}</code>
        </Text>

        <Hr style={hr} />

        {/* Features Section */}
        <Section style={featuresSection}>
          <Heading as="h2" style={h2}>🎁 Vos avantages gratuits</Heading>
          
          <Text style={featureItem}>
            🗺️ <strong>Catalogue Pays</strong> — Explorez 25+ destinations analysées en profondeur
          </Text>
          
          <Text style={featureItem}>
            🧪 <strong>Quick Test</strong> — Découvrez votre profil d'expatrié en 2 minutes
          </Text>
          
          <Text style={featureItem}>
            📊 <strong>Vue Pyramide</strong> — Comprenez les dynamiques cachées de chaque pays
          </Text>
          
          <Text style={featureItem}>
            🔑 <strong>Stratégies</strong> — Débloquez vos stratégies de mobilité personnalisées
          </Text>
          
          <Text style={featureItem}>
            🛠️ <strong>Outils</strong> — Calculateurs fiscaux, comparateurs, et plus encore
          </Text>
        </Section>

        <Hr style={hr} />

        {/* Footer */}
        <Text style={footer}>
          Si vous n'avez pas créé de compte sur Pyramid Compass, vous pouvez ignorer cet email.
        </Text>
        
        <Text style={footerBrand}>
          <Link href="https://world-alignment.lovable.app" style={footerLink}>
            Pyramid Compass
          </Link>
          {' '}— Votre boussole stratégique pour l'expatriation
        </Text>
        
        <Text style={footerLegal}>
          © 2025 EmotionsCare SASU. Tous droits réservés.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default ConfirmationEmail

// Styles
const main = {
  backgroundColor: '#1a1a2e',
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
}

const container = {
  margin: '0 auto',
  padding: '40px 20px',
  maxWidth: '580px',
}

const logoSection = {
  textAlign: 'center' as const,
  marginBottom: '24px',
}

const logo = {
  margin: '0 auto',
  borderRadius: '12px',
}

const h1 = {
  color: '#f59e0b',
  fontSize: '28px',
  fontWeight: 'bold',
  textAlign: 'center' as const,
  margin: '24px 0',
  padding: '0',
}

const h2 = {
  color: '#fbbf24',
  fontSize: '20px',
  fontWeight: 'bold',
  margin: '0 0 16px 0',
  padding: '0',
}

const text = {
  color: '#e5e5e5',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '16px 0',
  textAlign: 'center' as const,
}

const textMuted = {
  color: '#9ca3af',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '16px 0',
  textAlign: 'center' as const,
}

const buttonSection = {
  textAlign: 'center' as const,
  margin: '32px 0',
}

const button = {
  backgroundColor: '#f59e0b',
  borderRadius: '8px',
  color: '#1a1a2e',
  display: 'inline-block',
  fontSize: '16px',
  fontWeight: 'bold',
  padding: '14px 28px',
  textDecoration: 'none',
}

const code = {
  backgroundColor: '#2d2d44',
  borderRadius: '4px',
  color: '#fbbf24',
  fontSize: '14px',
  padding: '4px 8px',
}

const hr = {
  borderColor: '#374151',
  margin: '32px 0',
}

const featuresSection = {
  backgroundColor: '#16162b',
  borderRadius: '12px',
  padding: '24px',
  margin: '24px 0',
}

const featureItem = {
  color: '#d1d5db',
  fontSize: '14px',
  lineHeight: '24px',
  margin: '12px 0',
}

const footer = {
  color: '#6b7280',
  fontSize: '12px',
  lineHeight: '18px',
  margin: '24px 0 8px 0',
  textAlign: 'center' as const,
}

const footerBrand = {
  color: '#9ca3af',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '8px 0',
  textAlign: 'center' as const,
}

const footerLink = {
  color: '#f59e0b',
  textDecoration: 'none',
}

const footerLegal = {
  color: '#4b5563',
  fontSize: '11px',
  lineHeight: '16px',
  margin: '16px 0 0 0',
  textAlign: 'center' as const,
}
