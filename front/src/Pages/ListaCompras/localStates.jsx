import { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStates, createState } from '../../Hooks/useStates';
import style from './styles/index.module.scss';

export const SEVERIDAD = {
    critico:   { label: '🔥 Critico', color: 'var(--home-danger)', bg: 'var(--home-danger-soft)' },
    alto:      { label: '⚠️ Alto',    color: '#FB923C',           bg: 'rgba(251,146,60,0.16)' },
    medio:     { label: '🟡 Medio',   color: 'var(--home-warning)', bg: 'var(--home-warning-soft)' },
    bajo:      { label: '🟢 Bajo',    color: 'var(--home-success)', bg: 'var(--home-success-soft)' },
    ok:        { label: '✅ OK',      color: 'var(--home-text-soft)', bg: 'var(--home-bg-3)' },
    sin_datos: { label: '❓ Sin datos', color: 'var(--home-info)', bg: 'var(--home-info-soft)' },
};

export const localStates = () => {
    const { s, f } = useStates();
    const navigate = useNavigate();

    const grupoId = s.app?.grupoActual;
    const items = s.catalog?.shopping?.[grupoId] || [];
    const categorias = s.catalog?.categorias?.[grupoId] || [];
    const loading = !!s.loadings?.catalog?.shopping;

    const [cat, setCat] = createState(['listaUI', 'cat'], '');
    const [minPct, setMinPct] = createState(['listaUI', 'minPct'], 0);
    const [soloFaltantes, setSoloFaltantes] = createState(['listaUI', 'soloFaltantes'], true);
    const [incluirSinDatos, setIncluirSinDatos] = createState(['listaUI', 'incluirSinDatos'], true);
    const [q, setQ] = createState(['listaUI', 'q'], '');

    const filtrados = useMemo(() => {
        const ql = (q || '').trim().toLowerCase();
        if (!ql) return items;
        return items.filter(i => (i.nombre || '').toLowerCase().includes(ql));
    }, [items, q]);

    const totalFaltante = filtrados.reduce((acc, i) => acc + Number(i.faltante || 0), 0);
    const criticos = filtrados.filter(i => i.severidad === 'critico').length;

    const abrirAgregar = (it) => {
        const sug = Number(it.faltante || 0) > 0 ? it.faltante : 1;
        f.u1('catalog', 'movArticulo', { ...it, cantidadSugerida: sug });
        f.u1('catalog', 'movTipo', 'agregar');
        f.u2('modals', 'catalog', 'movModal', true);
    };

    const abrirEditar = (it) => {
        f.u1('catalog', 'editArticulo', it);
        f.u2('modals', 'catalog', 'formModal', true);
    };

    return {
        style, f, navigate,
        grupoId, items, categorias, loading,
        cat, setCat, minPct, setMinPct, soloFaltantes, setSoloFaltantes, incluirSinDatos, setIncluirSinDatos,
        q, setQ,
        filtrados, totalFaltante, criticos,
        abrirAgregar, abrirEditar,
    };
};

export const localEffects = () => {
    const { f, grupoId, cat, minPct, soloFaltantes, incluirSinDatos } = localStates();

    useEffect(() => { if (grupoId) f.catalog.categorias.listar(grupoId); }, [grupoId]);

    useEffect(() => {
        if (!grupoId) return;
        const params = { grupo_id: grupoId };
        if (cat) params.categoria_id = cat;
        if (minPct > 0) params.min_pct = minPct;
        if (soloFaltantes) params.solo_faltantes = '1';
        params.incluir_sin_datos = incluirSinDatos ? '1' : '0';
        f.catalog.shopping.listar(params);
    }, [grupoId, cat, minPct, soloFaltantes, incluirSinDatos]);
};
