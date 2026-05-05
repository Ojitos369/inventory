import { Link } from 'react-router-dom';
import style from './styles.module.scss';

export const P404 = () => (
    <div className={style.page}>
        <h1>404</h1>
        <p>Pagina no encontrada</p>
        <Link to="/" className="btn btn-primary" style={{ marginTop: 18 }}>Volver al inicio</Link>
    </div>
);
