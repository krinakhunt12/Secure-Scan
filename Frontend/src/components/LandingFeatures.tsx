
import React from 'react';
import { motion } from 'framer-motion';
import { 
  Zap, 
  ShieldCheck, 
  Globe, 
  Search, 
  Lock, 
  Cpu,
  Fingerprint,
  BarChart4,
  Terminal,
  ShieldAlert,
  Target,
  FileSearch,
  CheckCircle,
  Quote
} from 'lucide-react';

function LandingFeatures() {
  const features = [
    {
      icon: Cpu,
      title: "Advanced Heuristics",
      description: "Our proprietary verification engine analyzes server response patterns to identify misconfigurations before they become vulnerabilities.",
      color: "blue"
    },
    {
      icon: Lock,
      title: "Deep SSL Inspection",
      description: "Go beyond basic expiry checks. We analyze cipher suites, handshake protocols, and certificate transparency logs.",
      color: "cyan"
    },
    {
      icon: Fingerprint,
      title: "Header Fingerprinting",
      description: "Detailed analysis of CSP, HSTS, and X-Frame-Options to ensure your web server isn't leaking sensitive architecture info.",
      color: "indigo"
    },
    {
      icon: BarChart4,
      title: "Compliance Mapping",
      description: "Automatically map scan results against SOC2, HIPAA, and PCI-DSS frameworks for instant compliance snapshots.",
      color: "blue"
    }
  ];

  const processSteps = [
    {
      icon: Target,
      title: "Global Reconnaissance",
      desc: "Distributed nodes initiate encrypted probes to map the target's public-facing architecture."
    },
    {
      icon: FileSearch,
      title: "Vulnerability Discovery",
      desc: "Deep inspection of SSL/TLS configurations, HTTP headers, and exposed service versions."
    },
    {
      icon: Terminal,
      title: "Security Analysis Engine",
      desc: "Deep-packet heuristics correlate findings against known CVE databases and global threat pattern libraries."
    },
    {
      icon: CheckCircle,
      title: "Strategic Report",
      desc: "Detailed remediation steps and compliance scores are generated for immediate action."
    }
  ];

  const testimonials = [
    {
      name: "Alex Rivera",
      role: "CTO at NexusFin",
      quote: "SecureScan AI replaced our manual weekly audits. The depth of the automated diagnostics is unparalleled in the SaaS space.",
      avatar: "AR"
    },
    {
      name: "Sarah Chen",
      role: "Security Lead at CloudScale",
      quote: "The real-time threat intelligence feed has helped us patch zero-day vulnerabilities hours before they were widely exploited.",
      avatar: "SC"
    },
    {
      name: "Marcus Thorne",
      role: "Founder, Alpha Systems",
      quote: "Finally, a security tool that speaks 'developer'. The reports are clear, actionable, and extremely professional.",
      avatar: "MT"
    }
  ];

  const stats = [
    { label: "Active Probes", value: "250K+" },
    { label: "Vulns Detected", value: "1.8M" },
    { label: "Avg Scan Latency", value: "4.2s" },
    { label: "Uptime SLA", value: "99.99%" }
  ];

  return (
    <div className="w-full mt-24 space-y-32 mb-20">
      {/* Stats Section with Glassmorphism */}
      <motion.div 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="grid grid-cols-2 md:grid-cols-4 gap-8 px-4"
      >
        {stats.map((stat, i) => (
          <div key={i} className="text-center group">
            <div className="text-4xl font-bold text-white font-heading group-hover:text-blue-400 transition-colors">{stat.value}</div>
            <div className="text-[10px] text-slate-500 uppercase tracking-[0.2em] mt-2 font-bold">{stat.label}</div>
          </div>
        ))}
      </motion.div>

      {/* The Security Lifecycle */}
      <section className="px-4">
        <div className="text-center mb-20">
          <span className="text-blue-500 text-xs font-bold uppercase tracking-widest mb-4 block">Engine Architecture</span>
          <h2 className="text-4xl font-bold text-white font-heading">The 4-Stage Security Lifecycle</h2>
          <p className="text-slate-400 mt-4 max-w-2xl mx-auto text-lg">
            How our technical infrastructure dissects and secures your web assets in under 10 seconds.
          </p>
        </div>

        <div className="relative">
          {/* Connector Line for Desktop */}
          <div className="hidden lg:block absolute top-1/2 left-0 w-full h-px bg-linear-to-r from-transparent via-blue-500/30 to-transparent -translate-y-1/2" />
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 relative z-10">
            {processSteps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="flex flex-col items-center text-center group"
              >
                <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-white/10 flex items-center justify-center text-blue-400 mb-6 shadow-2xl group-hover:border-blue-500/50 group-hover:scale-110 transition-all duration-300 relative">
                  <step.icon size={28} />
                  <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center border-2 border-slate-950">
                    {i + 1}
                  </div>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed px-4">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Enterprise Capabilities */}
      <section className="px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group p-8 rounded-3xl border border-white/5 bg-slate-900/20 backdrop-blur-xl transition-all hover:bg-slate-900/40 hover:border-blue-500/20"
            >
              <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/5 text-blue-400 transition-all group-hover:bg-blue-500/10 group-hover:scale-110">
                <feature.icon size={28} />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* "How it Works" Visualized (Expanded) */}
      <section className="px-4 lg:px-0">
        <div className="max-w-6xl mx-auto py-16 px-8 rounded-[3rem] bg-linear-to-br from-blue-900/20 to-slate-900/40 border border-white/10 overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none radial-grid" />
          
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold mb-6">
                <Globe size={14} /> Global Threat Network
              </div>
              <h2 className="text-4xl lg:text-5xl font-bold text-white font-heading leading-tight">
                Detect What Others <br />
                <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-400 to-cyan-300">Intentionally Miss.</span>
              </h2>
              <p className="mt-8 text-slate-300 text-lg leading-relaxed">
                Most scanners stop at DNS. SecureScan AI probes deeper, simulating sophisticated attack patterns from 12 global regions to identify edge-case vulnerabilities in CDNs, load balancers, and WAF rules.
              </p>
              
              <div className="mt-12 space-y-6">
                {[
                  { label: "Distributed Port Discovery", desc: "Scan 65,535 ports in seconds across multiple IPs." },
                  { label: "Advanced Header Analysis", desc: "Identify leaking server versions and weak CSP policies." },
                  { label: "SSL/TLS Hardening", desc: "Validate against POODLE, Heartbleed, and weak ciphers." }
                ].map((item, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="mt-1 text-blue-500"><ShieldCheck size={20} /></div>
                    <div>
                      <h4 className="text-white font-bold text-sm">{item.label}</h4>
                      <p className="text-xs text-slate-500 mt-1">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              {/* Terminal Simulation */}
              <div className="rounded-2xl bg-[#0a0c10] border border-white/10 p-6 shadow-2xl relative overflow-hidden group">
                 <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-3">
                   <div className="flex gap-2">
                     <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                     <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                     <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                   </div>
                   <div className="text-[10px] font-mono text-slate-600 font-bold uppercase tracking-widest">Core Engine v3.1</div>
                 </div>
                 <div className="font-mono text-xs space-y-2 text-blue-400/90 h-70 overflow-hidden">
                   <p className="text-slate-500 animate-pulse"># Scanning example.com...</p>
                   <p className="text-blue-400">[SYSTEM] Multi-node handshake initiated...</p>
                   <p className="text-green-500">✓ US-EAST-1 established (12ms)</p>
                   <p className="text-green-500">✓ EU-WEST-2 established (48ms)</p>
                   <p className="text-green-500">✓ AP-SOUTH-1 established (110ms)</p>
                   <p className="text-blue-300 mt-2">[INFO] Analyzing SSL handshake protocols...</p>
                   <p className="text-white"> TLS 1.3 | AES-256-GCM | X25519</p>
                   <p className="text-yellow-500 mt-2">[WARN] HSTS header missing includeSubDomains</p>
                   <p className="text-red-500">[ALERT] Detected CVE-2024-XXXX (Critical)</p>
                   <p className="text-slate-500 mt-4"># Internal engine calculating risk score...</p>
                   <p className="text-blue-400 font-bold"># DONE. Generating Report ID: SCAN_8892_AX</p>
                   <div className="absolute bottom-6 left-6 right-6 h-1 bg-white/5 rounded-full overflow-hidden">
                     <motion.div 
                        initial={{ width: 0 }}
                        whileInView={{ width: '100%' }}
                        transition={{ duration: 4, repeat: Infinity }}
                        className="h-full bg-blue-500" 
                     />
                   </div>
                 </div>
              </div>
              
              {/* Background Glow */}
              <div className="absolute inset-0 bg-blue-500/30 blur-[100px] -z-10 animate-pulse"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="px-4">
        <div className="text-center mb-16">
          <Quote className="text-blue-500 mx-auto mb-4 opacity-50" size={40} />
          <h2 className="text-3xl font-bold text-white font-heading">Trusted by Security Professionals</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="p-8 rounded-3xl bg-white/2 border border-white/5 relative"
            >
              <p className="text-slate-300 italic mb-8 relative z-10">"{t.quote}"</p>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center font-bold text-white text-xs">
                  {t.avatar}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">{t.name}</h4>
                  <p className="text-[10px] text-slate-500 font-bold uppercase">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
      
      {/* Final CTA */}
      <section className="px-4 pt-10 text-center">
        <div className="max-w-3xl mx-auto">
          <h3 className="text-2xl font-bold text-white mb-6">Ready to secure your domain?</h3>
          <p className="text-slate-400 mb-8">Join thousands of companies using SecureScan AI to stay ahead of cyber threats.</p>
          <button 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="px-10 py-4 rounded-2xl bg-blue-600 text-white font-bold hover:bg-blue-500 transition-all hover:scale-105 shadow-xl shadow-blue-600/20"
          >
            Start Free Scan Now
          </button>
        </div>
      </section>
    </div>
  );
};

export default LandingFeatures;
