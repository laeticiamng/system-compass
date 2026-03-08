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
} from 'npm:@react-email/components@0.0.22'
import * as React from 'npm:react@18.3.1'

interface ConfirmationEmailProps {
  supabase_url: string
  email_action_type: string
  redirect_to: string
  token_hash: string
  token: string
  displayName?: string
}

export const ConfirmationEmail = ({
  displayName,
}: ConfirmationEmailProps) => (
  <Html>
    <Head />
    <Preview>Bienvenue sur Compass 🧭 - Votre compte est prêt !</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={logoSection}>
          <Img
            src="https://abysiagseykztutnbjtu.supabase.co/storage/v1/object/public/email-assets/logo-192.png?v=1"
            alt="System Compass Logo"
            width="80"
            height="80"
            style={logo}
          />
        </Section>

        <Heading style={h1}>
          {displayName ? `Bienvenue ${displayName} ! 🧭` : 'Bienvenue sur Compass 🧭'}
        </Heading>
        
        <Text style={text}>
          Votre compte a été créé avec succès ! Vous faites désormais partie de notre communauté d'expatriés stratégiques.
        </Text>

        <Section style={buttonSection}>
          <Link
            href="https://system-compass.app/quick-test"
            target="_blank"
            style={button}
          >
            🧪 Découvrir mon profil d'expatrié
          </Link>
        </Section>

        <Hr style={hr} />

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

        <Text style={footer}>
          Si vous n'avez pas créé de compte sur System Compass, vous pouvez ignorer cet email.
        </Text>
        
        <Text style={footerBrand}>
          <Link href="https://system-compass.app" style={footerLink}>
            System Compass
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
