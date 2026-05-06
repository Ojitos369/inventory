import { useStates } from '../../../../Hooks/useStates';
import { GeneralModal } from '../../../../Components/Modals/GeneralModal';
import { CategoriaForm } from '../../../../Components/CategoriaForm';

const FormContent = ({ close }) => {
    const { s } = useStates();
    const grupoId = s.app?.grupoActual;
    const editando = s.admin?.editCat;
    return (
        <CategoriaForm
            grupoId={grupoId}
            editando={editando}
            onSaved={() => close?.()}
        />
    );
};

export const CatFormModal = () => (
    <GeneralModal lvl1="admin" lvl2="catForm" Component={FormContent} title="Categoria" size="sm" />
);
