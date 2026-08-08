import '@fontsource-variable/onest';
import './styles.css';
import { createLaboratoryApp } from './ui/app-shell';

const root = document.querySelector<HTMLDivElement>('#app');

if (!root) {
  throw new Error('Counterspace Field Laboratory could not find its application root.');
}

createLaboratoryApp(root);
