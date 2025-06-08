<template>
  <div class="home-view">
    <div class="hero">
      <h1>
        <span class="logo-badge"><IconApi />API_Server</span>
      </h1>
      <p class="subtitle">
        <span class="subtitle-badge">Unified API Testing & Mock Platform</span>
      </p>
      <p class="intro">
        Fast, safe, and flexible endpoints for all your development and QA needs.
      </p>
    </div>
    <div class="features-row">
      <div class="feature-card">
        <span class="feature-icon">🧪</span>
        <div>
          <div class="feature-title">Multi-Protocol Support</div>
          <div class="feature-desc">HTTP, TCP/UDP, MQTT, WebDAV and more, all in one place.</div>
        </div>
      </div>
      <div class="feature-card">
        <span class="feature-icon">⚡</span>
        <div>
          <div class="feature-title">Instant Mock & Echo</div>
          <div class="feature-desc">Quickly mock responses or echo requests for rapid debugging.</div>
        </div>
      </div>
      <div class="feature-card">
        <span class="feature-icon">🔒</span>
        <div>
          <div class="feature-title">Safe & Isolated</div>
          <div class="feature-desc">No data persistence, no production risk, always sandboxed.</div>
        </div>
      </div>
      <div class="feature-card">
        <span class="feature-icon">📖</span>
        <div>
          <div class="feature-title">Live API Docs</div>
          <div class="feature-desc">Interactive documentation and try-it-now for every endpoint.</div>
        </div>
      </div>
    </div>
    <div class="quickstart-section">
      <h2>🚀 Quick Start</h2>
      <ol>
        <li><span class="step-badge">1</span> Explore <b>API Docs</b> in the sidebar.</li>
        <li><span class="step-badge">2</span> Try endpoints in the <b>API Explorer</b>.</li>
        <li><span class="step-badge">3</span> Integrate with your scripts or tools.</li>
      </ol>
    </div>
    <div class="footer">
      <p>
        <b>API_Server</b> is open source and free for internal development and QA.<br>
        <span class="footer-highlight">Questions or suggestions? <a href="mailto:maintainer@example.com">Contact us</a>.</span>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import IconApi from '@/components/icons/IconApi.vue';
</script>

<style scoped>
.home-view {
  width: 100%;
  margin: 0.5rem auto;
  padding: 2.5rem 1.5rem 1.5rem 1.5rem;
  border-radius: 22px;
  background: linear-gradient(135deg, #e3f0ff 0%, #f8fafc 100%);
  box-shadow: 0 8px 32px rgba(30,41,59,0.13);
  font-family: 'Segoe UI', 'PingFang SC', 'Hiragino Sans', Arial, sans-serif;
}

.hero {
  text-align: center;
  margin-bottom: 2.2rem;
}

.logo-badge {
  display: inline-block;
  width: 100%;
  background: linear-gradient(90deg, #1976d2 60%, #42a5f5 100%);
  color: #fff;
  font-size: 2.5rem;
  font-weight: 900;
  border-radius: 20px;
  padding: 0.28em 1.7em;
  letter-spacing: 2.5px;
  box-shadow: 0 2px 14px rgba(25, 118, 210, 0.15);
}

.logo-badge svg {
  vertical-align: middle;
  width: 1em;
  height: 1em;
}

.subtitle {
  margin-top: 0.8rem;
  margin-bottom: 0.2rem;
}

.subtitle-badge {
  display: inline-block;
  background: #e3f2fd;
  color: #1976d2;
  font-size: 1.18rem;
  font-weight: 700;
  border-radius: 13px;
  padding: 0.22em 1.3em;
  letter-spacing: 1.2px;
  box-shadow: 0 1px 7px rgba(25, 118, 210, 0.08);
}

.intro {
  color: #4a5568;
  font-size: 1.08rem;
  margin-top: 0.7rem;
  margin-bottom: 0.2rem;
  font-weight: 500;
}

.features-row {
  display: flex;
  flex-wrap: wrap;
  gap: 1.2rem;
  margin: 2.2rem 0 2.2rem 0;
  justify-content: space-between;
}

.feature-card {
  flex: 1 1 200px;
  min-width: 180px;
  max-width: 48%;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 2px 10px rgba(30,41,59,0.07);
  padding: 1.2em 1.3em;
  display: flex;
  align-items: flex-start;
  gap: 1em;
  margin-bottom: 0.5em;
  border: 1px solid #e3e8f0;
  transition: box-shadow 0.2s, transform 0.2s;
}
.feature-card:hover {
  box-shadow: 0 6px 20px rgba(30,41,59,0.15);
  transform: translateY(-3px) scale(1.025);
}

.feature-icon {
  font-size: 2.3em;
  margin-top: 0.1em;
}

.feature-title {
  font-weight: 800;
  color: #1976d2;
  font-size: 1.13em;
  margin-bottom: 0.12em;
  letter-spacing: 0.5px;
}

.feature-desc {
  color: #444;
  font-size: 1em;
  font-weight: 500;
}

.quickstart-section {
  margin: 2.5rem 0 1.5rem 0;
}

.quickstart-section h2 {
  font-size: 1.22rem;
  color: #1976d2;
  margin-bottom: 0.7rem;
  font-weight: 800;
}

.quickstart-section ol {
  margin: 0.7em 0 0 1.2em;
  color: #333;
  font-size: 1.07em;
}

.step-badge {
  display: inline-block;
  background: #1976d2;
  color: #fff;
  border-radius: 50%;
  width: 1.5em;
  height: 1.5em;
  text-align: center;
  line-height: 1.5em;
  font-weight: bold;
  margin-right: 0.5em;
  font-size: 1em;
}

.footer {
  text-align: center;
  color: #888;
  font-size: 1em;
  margin-top: 2.5rem;
}

.footer-highlight {
  display: inline-block;
  background: #e3f2fd;
  color: #1976d2;
  border-radius: 10px;
  padding: 0.1em 0.8em;
  margin-top: 0.5em;
  font-weight: 500;
}
.footer-highlight a {
  color: #1976d2;
  text-decoration: underline;
  font-weight: 600;
}

@media (max-width: 900px) {
  .home-view {
    padding: 1.2rem 0.5rem;
    max-width: 99vw;
  }
  .features-row {
    flex-direction: column;
    gap: 1.1rem;
  }
  .feature-card {
    max-width: 100%;
  }
}
</style>