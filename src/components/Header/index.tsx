import { FaCode } from 'react-icons/fa';
import styles from './header.module.scss';

export default function Header(): JSX.Element {
  return (
    <header className={styles.headerContainer}>
      <div className={styles.headerContent}>
        <FaCode className={styles.headerIcon} />
        <a href="/">spacetraveling</a>
        <span className={styles.headerPoint}>.</span>
      </div>
    </header>
  );
}
