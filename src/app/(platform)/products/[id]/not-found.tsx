import Link from "next/link";
import styles from "./page.module.css";

export default function ProductNotFound() {
  return (
    <div className={styles.page}>
      <section className={styles.notice}>
        <h1>Produto não encontrado</h1>
        <p>Este produto pode ter sido removido ou o endereço está incorreto.</p>
        <Link href="/">Voltar aos produtos</Link>
      </section>
    </div>
  );
}
