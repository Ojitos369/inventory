import { useRef, useCallback } from 'react';
import { useStates, createState } from '../../Hooks/useStates';
import { fileToBase64, compressImage } from '../../Core/helper';
import { sha256Hex } from '../../Core/cache';
import style from './styles/index.module.scss';

export const MODES = [
    { id: 'reemplazar', label: 'Reemplazar', icon: '🔁', short: 'Reempl.' },
    { id: 'agregar', label: 'Agregar', icon: '➕', short: 'Agrega' },
    { id: 'ignorar', label: 'Ignorar', icon: '🚫', short: 'Ignora' },
];

export const PROGRESS_LABELS = {
    subiendo: 'Subiendo imagen…',
    llm: 'Analizando imagen con IA…',
    match: 'Buscando coincidencias en el inventario…',
    crops: 'Recortando objetos detectados…',
    done: 'Listo',
};

export const localStates = () => {
    const { s, f } = useStates();

    const grupoId = s.app?.grupoActual;
    const captura = s.vision?.captura;
    const loadingAnalyze = !!s.loadings?.vision?.analyze;
    const loadingApply = !!s.loadings?.vision?.aplicar;
    const progreso = captura?.progreso || null;
    const partialItems = captura?.items || [];

    const [preview, setPreview] = createState(['conteoFoto', 'preview'], null);
    const [, setPreviewHash] = createState(['conteoFoto', 'previewHash'], '');
    const [hint, setHint] = createState(['conteoFoto', 'hint'], '');
    const [items, setItems] = createState(['conteoFoto', 'items'], []);
    const [dragActive, setDragActive] = createState(['conteoFoto', 'dragActive'], false);
    const [zoomImg, setZoomImg] = createState(['conteoFoto', 'zoomImg'], null);

    const cameraInputRef = useRef(null);
    const fileInputRef = useRef(null);

    const elegir = useCallback(async (file) => {
        if (!file) return;
        if (!file.type?.startsWith('image/')) {
            f.general.notificacion({ message: 'Tipo de archivo invalido', mode: 'danger', title: 'Error' });
            return;
        }
        let comprimido = file;
        try {
            comprimido = await compressImage(file, { maxSide: 1024, quality: 0.7, targetBytes: 500 * 1024 });
        } catch (_) { /* si falla, manda original */ }
        const b64 = await fileToBase64(comprimido);
        const hash = await sha256Hex(b64);
        setPreview(b64);
        setPreviewHash(hash);
        if (!grupoId) return;
        f.vision.captura.analizar(grupoId, b64, hint, (res) => {
            const conModo = (res.items || []).map(it => ({
                ...it,
                modo: it.articulo_id ? 'reemplazar' : 'agregar',
            }));
            setItems(conModo);
        });
    }, [grupoId, hint]);

    const onPickCam = (e) => elegir(e.target.files?.[0]);
    const onPickFile = (e) => elegir(e.target.files?.[0]);

    const onDrop = (e) => {
        e.preventDefault(); e.stopPropagation();
        setDragActive(false);
        const file = e.dataTransfer?.files?.[0];
        if (file) elegir(file);
    };
    const onDragOver = (e) => {
        e.preventDefault(); e.stopPropagation();
        setDragActive(true);
    };
    const onDragLeave = (e) => {
        e.preventDefault(); e.stopPropagation();
        setDragActive(false);
    };

    const updateItem = (idx, key, value) => {
        const next = [...items];
        next[idx] = { ...next[idx], [key]: value };
        setItems(next);
    };
    const setAllModo = (modo) => setItems(items.map(i => ({ ...i, modo })));
    const removeItem = (idx) => setItems(items.filter((_, i) => i !== idx));

    const reset = () => {
        setPreview(null);
        setPreviewHash('');
        setItems([]);
        setHint('');
    };

    const aplicar = () => {
        if (!captura?.captura_id) return;
        const limpios = items
            .filter(i => i.objeto && i.modo !== 'ignorar')
            .map(i => ({
                objeto: i.objeto,
                cantidad: Number(i.cantidad || 0),
                unidad: i.unidad || 'pz',
                modo: i.modo || 'reemplazar',
            }));
        f.vision.captura.aplicar(captura.captura_id, 'reemplazar', limpios, () => reset());
    };

    const cancelar = () => { f.vision.captura.limpiar(); reset(); };

    return {
        style, MODES, PROGRESS_LABELS, f,
        grupoId, captura, loadingAnalyze, loadingApply,
        progreso, partialItems,
        preview, hint, setHint, items,
        dragActive, cameraInputRef, fileInputRef,
        zoomImg, setZoomImg,
        onPickCam, onPickFile, onDrop, onDragOver, onDragLeave,
        updateItem, setAllModo, removeItem,
        aplicar, cancelar,
    };
};

export const localEffects = () => { /* sin efectos: estado vive en global */ };
