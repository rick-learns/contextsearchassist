import React from 'react';
import styles from './Trust.module.css';

const testimonials = [
  {
    id: 1,
    quote: "ContextSearch Assist completely changed how our team navigates Jira. We're saving hours every week by finding related tickets instantly.",
    author: "Sarah Johnson",
    role: "Engineering Manager",
    company: "TechCorp Inc."
  },
  {
    id: 2,
    quote: "The contextual search is simply brilliant. It understands what I'm looking for even when I don't use exact keywords.",
    author: "Michael Chen",
    role: "Senior Developer",
    company: "Innovate Solutions"
  },
  {
    id: 3,
    quote: "This extension has become an essential tool for our project management. It's like having an AI assistant that knows our entire ticket history.",
    author: "Jessica Williams",
    role: "Product Owner",
    company: "Digital Dynamics"
  }
];

const Trust = () => {
  return (
    <section className={styles.trust} id="trust">
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>Trusted by Development Teams</h2>
          <p className={styles.subtitle}>
            Hear what teams using ContextSearch Assist have to say
          </p>
        </div>
        
        <div className={styles.testimonials}>
          {testimonials.map((testimonial) => (
            <div key={testimonial.id} className={styles.testimonial}>
              <div className={styles.quoteIcon}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10 11H6.21C6.48 9.84 7.79 9 9 9C9.2 9 9.4 9.04 9.58 9.11C9.79 9.21 10 9.16 10.13 9.03L11.51 7.65C11.78 7.38 11.75 6.96 11.44 6.72C10.74 6.26 9.92 6 9 6C6 6 3.5 8.5 3.5 11.5V15.5C3.5 17.43 5.07 19 7 19C8.93 19 10.5 17.43 10.5 15.5V11.5C10.5 11.22 10.28 11 10 11Z" fill="currentColor" />
                  <path d="M20.5 11H16.71C16.98 9.84 18.29 9 19.5 9C19.7 9 19.9 9.04 20.08 9.11C20.28 9.21 20.5 9.16 20.63 9.03L22.01 7.65C22.28 7.38 22.25 6.96 21.94 6.72C21.24 6.26 20.42 6 19.5 6C16.5 6 14 8.5 14 11.5V15.5C14 17.43 15.57 19 17.5 19C19.43 19 21 17.43 21 15.5V11.5C21 11.22 20.78 11 20.5 11Z" fill="currentColor" />
                </svg>
              </div>
              <p className={styles.quote}>{testimonial.quote}</p>
              <div className={styles.author}>
                <p className={styles.name}>{testimonial.author}</p>
                <p className={styles.role}>{testimonial.role}, {testimonial.company}</p>
              </div>
            </div>
          ))}
        </div>
        
        <div className={styles.companies}>
          <h3 className={styles.companiesTitle}>Used by teams at</h3>
          <div className={styles.companyLogos}>
            <div className={styles.logo}>Company 1</div>
            <div className={styles.logo}>Company 2</div>
            <div className={styles.logo}>Company 3</div>
            <div className={styles.logo}>Company 4</div>
            <div className={styles.logo}>Company 5</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Trust;