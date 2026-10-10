import LandingHeader from "@/components/landing/landing-header";
import LandingHero from "@/components/landing/landing-hero";
import LandingUseCases from "@/components/landing/landing-use-cases";
import LandingFeatures from "@/components/landing/landing-features";
import LandingHowItWorks from "@/components/landing/landing-how-it-works";
import LandingPricing from "@/components/landing/landing-pricing";
import LandingFaq from "@/components/landing/landing-faq";
import LandingCta from "@/components/landing/landing-cta";
import LandingFooter from "@/components/landing/landing-footer";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <LandingHeader />
      <LandingHero />
      <LandingUseCases />
      <LandingFeatures />
      <LandingHowItWorks />
      <LandingPricing />
      <LandingFaq />
      <LandingCta />
      <LandingFooter />
    </div>
  );
}
