import { MarketingNav } from '@/components/marketing/nav/MarketingNav';
import { PricingSection } from '@/components/marketing/sections/PricingSection';
import { FAQSection } from '@/components/marketing/sections/FAQSection';
import { FinalCTA } from '@/components/marketing/sections/FinalCTA';
import { MarketingFooter } from '@/components/marketing/footer/MarketingFooter';

export const metadata = {
  title: 'Pricing | Reqflow',
  description: 'Free during early access. No credit card required.',
};

export default function PricingPage() {
  return (
    <>
      <MarketingNav />
      <PricingSection />
      <FAQSection />
      <FinalCTA />
      <MarketingFooter />
    </>
  );
}
