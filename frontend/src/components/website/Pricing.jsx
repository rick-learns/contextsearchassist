import React from 'react';
import styles from './Pricing.module.css';
import Button from '../common/Button';

const plans = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    description: 'Perfect for individual developers and small teams',
    features: [
      'Contextual search in current ticket',
      'Basic Jira integration',
      'Browser extension',
      '10 searches per day',
      'Standard support'
    ],
    cta: 'Get Started Free',
    popular: false
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 15,
    description: 'Ideal for teams that need advanced features',
    features: [
      'Everything in Free, plus:',
      'Unlimited searches',
      'Advanced filters',
      'Search history',
      'Export results to CSV',
      'Priority support'
    ],
    cta: 'Get Pro',
    popular: true
  },
  {
    id: 'team',
    name: 'Team',
    price: 49,
    description: 'For organizations with multiple teams',
    features: [
      'Everything in Pro, plus:',
      'Team collaboration features',
      'Shared search history',
      'Admin dashboard',
      'Custom Jira integration',
      'Dedicated support',
      'SSO Authentication'
    ],
    cta: 'Contact Sales',
    popular: false
  }
];

const Pricing = () => {
  return (
    <section className={styles.pricing} id="pricing">
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>Simple, Transparent Pricing</h2>
          <p className={styles.subtitle}>
            Choose the plan that fits your needs. All plans include our core contextual search features.
          </p>
        </div>
        
        <div className={styles.plans}>
          {plans.map((plan) => (
            <div 
              key={plan.id} 
              className={`${styles.plan} ${plan.popular ? styles.popular : ''}`}
            >
              {plan.popular && <div className={styles.popularBadge}>Most Popular</div>}
              <div className={styles.planHeader}>
                <h3 className={styles.planName}>{plan.name}</h3>
                <div className={styles.planPrice}>
                  <span className={styles.currency}>$</span>
                  <span className={styles.amount}>{plan.price}</span>
                  {plan.price > 0 && <span className={styles.period}>/month</span>}
                </div>
                <p className={styles.planDescription}>{plan.description}</p>
              </div>
              
              <ul className={styles.featureList}>
                {plan.features.map((feature, index) => (
                  <li key={index} className={styles.feature}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M5 13L9 17L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
              
              <div className={styles.planFooter}>
                <Button 
                  variant={plan.popular ? 'primary' : 'outline'} 
                  fullWidth
                >
                  {plan.cta}
                </Button>
              </div>
            </div>
          ))}
        </div>
        
        <div className={styles.enterprise}>
          <div className={styles.enterpriseContent}>
            <h3 className={styles.enterpriseTitle}>Need a custom plan for your enterprise?</h3>
            <p className={styles.enterpriseDescription}>
              We offer custom solutions for large organizations with specific requirements. Contact our sales team to discuss your needs.
            </p>
          </div>
          <div className={styles.enterpriseCta}>
            <Button variant="secondary">Contact Sales</Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Pricing;