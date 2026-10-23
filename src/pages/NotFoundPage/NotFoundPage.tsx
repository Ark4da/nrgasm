import { Link } from 'react-router';
import { buttonClass } from '../../components/Button/buttonClass';
import styles from './NotFoundPage.module.css';

interface NotFoundPageProps {
  title?: string;
  message?: string;
}

export function NotFoundPage({
  title = 'Page not found',
  message = 'This address does not lead anywhere in NRGASM.',
}: NotFoundPageProps) {
  return (
    <div className={styles.page}>
      <title>{`${title} | NRGASM`}</title>
      <p className={styles.code} aria-hidden="true">404</p>
      <h1 className={styles.title}>{title}</h1>
      <p className={styles.message}>{message}</p>
      <Link to="/catalog" className={buttonClass('primary')}>
        Back to the catalog
      </Link>
    </div>
  );
}
