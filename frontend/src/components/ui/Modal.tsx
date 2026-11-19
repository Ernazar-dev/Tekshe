import { Modal as AntModal } from 'antd';
import type { ReactNode } from 'react';
import { Icon } from './Icon';

/**
 * Ant Design Modal: ekran ortasında, ishki bólimi skroll boladı (100vh tolmaydı).
 * Esc hám fon arqalı jabıw, fokus tutqını — Ant Design ózi islep beredi.
 */
export const Modal = ({
  open,
  onClose,
  title,
  eyebrow,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  eyebrow?: string;
  children: ReactNode;
}) => (
  <AntModal
    open={open}
    onCancel={onClose}
    footer={null}
    centered
    destroyOnHidden
    width={540}
    closeIcon={<Icon name="close" size={18} />}
    title={
      <div className="pr-6">
        {eyebrow && <div className="eyebrow !text-primary">{eyebrow}</div>}
        <div className="font-serif-title mt-1 text-2xl font-semibold leading-tight">{title}</div>
      </div>
    }
    styles={{ body: { maxHeight: 'calc(100dvh - 190px)', overflowY: 'auto', paddingTop: 12 } }}
  >
    {children}
  </AntModal>
);
