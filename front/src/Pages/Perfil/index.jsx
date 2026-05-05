import { useEffect, useMemo, useState } from 'react';
import { useStates } from '../../Hooks/useStates';
import style from './styles/index.module.scss';

export const Perfil = () => {
    const { s, f } = useStates();
    const u = useMemo(() => s.usuario?.data || {}, [s.usuario?.data]);
    const grupos = useMemo(() => s.usuario?.grupos || [], [s.usuario?.grupos]);

    const [nombre, setNombre] = useState('');
    const [email, setEmail] = useState('');
    const [actual, setActual] = useState('');
    const [nueva, setNueva] = useState('');
    const [nuevaConf, setNuevaConf] = useState('');

    useEffect(() => {
        setNombre(u.nombre || '');
        setEmail(u.email || '');
    }, [u.id]);

    const guardarPerfil = (e) => {
        e?.preventDefault?.();
        f.users.updateMe({ nombre, email });
    };
    const cambiarPasswd = (e) => {
        e?.preventDefault?.();
        if (nueva !== nuevaConf) {
            f.general.notificacion({ message: "Las contrasenas no coinciden", mode: "danger", title: "Error" });
            return;
        }
        f.auth.changePassword(actual, nueva, () => { setActual(''); setNueva(''); setNuevaConf(''); });
    };

    return (
        <div className={style.page}>
            <h2 style={{ fontFamily: 'var(--home-font-display)', fontSize: '1.4rem' }}>Mi perfil</h2>

            <form className={style.section} onSubmit={guardarPerfil}>
                <h3>Datos personales</h3>
                <div className={style.formGroup}>
                    <label>Usuario</label>
                    <input value={u.username || ''} disabled />
                </div>
                <div className={style.formGroup}>
                    <label>Nombre</label>
                    <input value={nombre} onChange={e => setNombre(e.target.value)} />
                </div>
                <div className={style.formGroup}>
                    <label>Email</label>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} />
                </div>
                <button type="submit" className="btn btn-primary">Guardar</button>
            </form>

            <form className={style.section} onSubmit={cambiarPasswd}>
                <h3>Cambiar contrasena</h3>
                <div className={style.formGroup}>
                    <label>Contrasena actual</label>
                    <input type="password" value={actual} onChange={e => setActual(e.target.value)} required />
                </div>
                <div className={style.formGroup}>
                    <label>Nueva</label>
                    <input type="password" value={nueva} onChange={e => setNueva(e.target.value)} required />
                </div>
                <div className={style.formGroup}>
                    <label>Confirmar nueva</label>
                    <input type="password" value={nuevaConf} onChange={e => setNuevaConf(e.target.value)} required />
                </div>
                <button type="submit" className="btn btn-primary">Actualizar</button>
            </form>

            <div className={style.section}>
                <h3>Mis grupos</h3>
                {grupos.length === 0 && <p style={{ color: 'var(--home-text-muted)' }}>No perteneces a ningun grupo.</p>}
                {grupos.map(g => (
                    <div key={g.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--home-border)' }}>
                        <span>{g.icono ? `${g.icono} ` : ''}{g.nombre}</span>
                        <span style={{ color: 'var(--home-text-muted)', fontSize: '0.85rem' }}>{g.rol}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};
