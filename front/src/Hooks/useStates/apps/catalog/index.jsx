import { categorias as categoriasMod } from './categorias';
import { articulos as articulosMod } from './articulos';
import { movimientos as movimientosMod } from './movimientos';
import { ia as iaMod } from './ia';
import { shopping as shoppingMod } from './shopping';

export const catalog = props => {
    const categorias = categoriasMod(props);
    const articulos = articulosMod(props);
    const movimientos = movimientosMod(props);
    const ia = iaMod(props);
    const shopping = shoppingMod(props);
    return { categorias, articulos, movimientos, ia, shopping };
};
