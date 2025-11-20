import styles from "./components/Home.module.css";

export default function Home() {
  return (
    <div>
      {/* Glassmorphism Profile Section */}
      <section className={styles.profileSection}>
        <div className={styles.profileContainer}>
          <div className={styles.profileImage}>👨‍💻</div>
          <div className={styles.profileContent}>
            <h2>Your Name</h2>
            <p className={styles.title}>Developer</p>
            <p className={styles.description}>
              Welcome to my portfolio
            </p>
            <div className={styles.socialLinks}>
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className={styles.socialLink} title="GitHub">
                GH
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className={styles.socialLink} title="Twitter">
                TW
              </a>
              <a href="https://discord.com" target="_blank" rel="noopener noreferrer" className={styles.socialLink} title="Discord">
                DC
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
