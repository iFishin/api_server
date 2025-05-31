<template>
  <div class="home-view">
    <div class="hero">
      <h1>
        <span class="logo-badge">API_Server</span>
      </h1>
      <p class="subtitle">
        <span class="subtitle-badge">All-in-one API Testing Platform</span>
      </p>
    </div>
    <div class="features-row">
      <div class="feature-card">
        <span class="feature-icon">🧪</span>
        <div>
          <div class="feature-title">Rich API Coverage</div>
          <div class="feature-desc">HTTP, file, parameter, and custom protocol endpoints for every scenario.</div>
        </div>
      </div>
      <div class="feature-card">
        <span class="feature-icon">⚡</span>
        <div>
          <div class="feature-title">Easy Integration</div>
          <div class="feature-desc">Plug-and-play endpoints for rapid test automation and debugging.</div>
        </div>
      </div>
      <div class="feature-card">
        <span class="feature-icon">🔒</span>
        <div>
          <div class="feature-title">Safe & Isolated</div>
          <div class="feature-desc">Sandboxed data, no impact on production, safe for all test cases.</div>
        </div>
      </div>
      <div class="feature-card">
        <span class="feature-icon">📖</span>
        <div>
          <div class="feature-title">Interactive Docs</div>
          <div class="feature-desc">Browse, try, and understand every API with live documentation.</div>
        </div>
      </div>
    </div>
    <div class="quickstart-section">
      <h2>🚀 Quick Start</h2>
      <ol>
        <li><span class="step-badge">1</span> Browse <b>API Documentation</b> in the sidebar.</li>
        <li><span class="step-badge">2</span> Use the <b>API Explorer</b> to send requests and view responses instantly.</li>
        <li><span class="step-badge">3</span> Integrate endpoints into your test scripts or tools as needed.</li>
      </ol>
    </div>
    <div class="footer">
      <p>
        <b>API_Server</b> is open for internal testing and development use.<br>
        <span class="footer-highlight">Feedback or feature requests? Contact the project maintainer.</span>
      </p>
    </div>
  </div>
</template>

<style scoped>
.home-view {
  width: 100%;
  height: 100%;
  margin: 2.5rem auto;
  padding: 2.5rem 1.5rem 1.5rem 1.5rem;
  border-radius: 20px;
  background: linear-gradient(135deg, #e3f0ff 0%, #f8fafc 100%);
  box-shadow: 0 8px 32px rgba(30,41,59,0.12);
  font-family: 'Segoe UI', 'PingFang SC', 'Hiragino Sans', Arial, sans-serif;
}

.hero {
  text-align: center;
  margin-bottom: 2.2rem;
}

.logo-badge {
  display: inline-block;
  background: linear-gradient(90deg, #1976d2 60%, #42a5f5 100%);
  color: #fff;
  font-size: 2.7rem;
  font-weight: 800;
  border-radius: 18px;
  padding: 0.25em 1.5em;
  letter-spacing: 2px;
  box-shadow: 0 2px 12px rgba(25, 118, 210, 0.13);
}

.subtitle {
  margin-top: 0.7rem;
  margin-bottom: 0.2rem;
}

.subtitle-badge {
  display: inline-block;
  background: #fff3e0;
  color: #ef6c00;
  font-size: 1.15rem;
  font-weight: 600;
  border-radius: 12px;
  padding: 0.18em 1.2em;
  letter-spacing: 1px;
  box-shadow: 0 1px 6px rgba(239, 108, 0, 0.07);
}

.features-row {
  display: flex;
  flex-wrap: wrap;
  gap: 1.2rem;
  margin: 2.2rem 0 2.2rem 0;
  justify-content: space-between;
}

.feature-card {
  flex: 1 1 180px;
  min-width: 180px;
  max-width: 48%;
  background: #fff;
  border-radius: 14px;
  box-shadow: 0 2px 8px rgba(30,41,59,0.06);
  padding: 1.1em 1.2em;
  display: flex;
  align-items: flex-start;
  gap: 1em;
  margin-bottom: 0.5em;
  border: 1px solid #e3e8f0;
  transition: box-shadow 0.2s, transform 0.2s;
}
.feature-card:hover {
  box-shadow: 0 4px 16px rgba(30,41,59,0.13);
  transform: translateY(-2px) scale(1.02);
}

.feature-icon {
  font-size: 2.1em;
  margin-top: 0.1em;
}

.feature-title {
  font-weight: 700;
  color: #1976d2;
  font-size: 1.08em;
  margin-bottom: 0.1em;
}

.feature-desc {
  color: #444;
  font-size: 0.98em;
}

.quickstart-section {
  margin: 2.5rem 0 1.5rem 0;
}

.quickstart-section h2 {
  font-size: 1.25rem;
  color: #1976d2;
  margin-bottom: 0.7rem;
  font-weight: 700;
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
@media (max-width: 700px) {
  .features-row {
    flex-direction: column;
    gap: 1.1rem;
  }
  .feature-card {
    max-width: 100%;
  }
  .home-view {
    padding: 1.2rem 0.5rem;
  }
}
</style>