import { useRef, useState } from 'react';
import { useStates } from '../../Hooks/useStates';
import { compressImage } from '../../Core/helper';
import style from './styles/index.module.scss';


/**
 * ImageUploader: input file con preview y subida automatica al backend.
 *
 * Props:
 *   value: string (URL o path actual)
 *   onChange: (url) => void   // recibe '/media/...' (string) cuando sube o '' al limpiar
 *   folder: 'articulos' | 'categorias' | 'avatars' | 'misc'
 *   label: string
 */
export const ImageUploader = ({ value, onChange, folder = 'articulos', label = 'Imagen' }) => {
    const { f } = useStates();
    const [uploading, setUploading] = useState(false);
    const [err, setErr] = useState(null);
    const inputRef = useRef(null);

    const previewSrc = value ? f.general.mediaUrl(value) : null;

    const subir = async (file) => {
        setErr(null);
        if (!file) return;
        if (!file.type?.startsWith('image/')) {
            setErr('Tipo invalido');
            return;
        }
        setUploading(true);
        try {
            // comprime antes de subir (target ~1.5MB, max lado 1600)
            let comprimido = file;
            try {
                comprimido = await compressImage(file, { maxSide: 1600, quality: 0.82, targetBytes: 1.5 * 1024 * 1024 });
            } catch (_) { /* manda original */ }
            const r = await f.general.uploadImage(comprimido, folder);
            onChange?.(r.url);
        } catch (e) {
            setErr(e?.response?.data?.detail || 'Error al subir');
        } finally {
            setUploading(false);
            if (inputRef.current) inputRef.current.value = '';
        }
    };

    return (
        <div className={style.uploader}>
            {label && <label className={style.label}>{label}</label>}
            <div className={style.box}>
                {previewSrc ? (
                    <div className={style.preview}>
                        <img src={previewSrc} alt="" />
                        <div className={style.overlay}>
                            <button
                                type="button"
                                className={style.btn}
                                onClick={() => inputRef.current?.click()}
                                disabled={uploading}
                            >Cambiar</button>
                            <button
                                type="button"
                                className={`${style.btn} ${style.danger}`}
                                onClick={() => onChange?.('')}
                                disabled={uploading}
                            >Quitar</button>
                        </div>
                    </div>
                ) : (
                    <button
                        type="button"
                        className={style.dropzone}
                        onClick={() => inputRef.current?.click()}
                        disabled={uploading}
                    >
                        <span className={style.icon}>📷</span>
                        <span>{uploading ? 'Subiendo…' : 'Toca para subir imagen'}</span>
                        <span className={style.hint}>JPG/PNG/WEBP · max 8MB</span>
                    </button>
                )}
            </div>
            <input
                ref={inputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={e => subir(e.target.files?.[0])}
            />
            {err && <div className={style.error}>{err}</div>}
        </div>
    );
};
