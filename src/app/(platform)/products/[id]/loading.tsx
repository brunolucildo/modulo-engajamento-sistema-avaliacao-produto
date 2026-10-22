import styles from "./page.module.css";

export default function ProductLoading() {
  return (
    <div className={styles.page} role="status" aria-live="polite">
      Carregando produto e avaliações…
    </div>
  );
}
