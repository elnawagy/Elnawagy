import React, { useState, useMemo } from 'react';
import type { Customer } from '../types';
import { useLocalization } from '../hooks/useLocalization';
import { useSystem } from '../hooks/useSystem';
import { SearchIcon } from './icons';
import { Modal } from './Modal';

interface CustomerSearchModalProps {
  onClose: () => void;
  onSelectCustomer: (customerId: string) => void;
}

export const CustomerSearchModal: React.FC<CustomerSearchModalProps> = ({ onClose, onSelectCustomer }) => {
  const { t } = useLocalization();
  const { customers } = useSystem();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCustomers = useMemo(() => {
    if (!searchTerm) return customers;
    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.phone.includes(searchTerm)
    );
  }, [customers, searchTerm]);

  const handleSelect = (customerId: string) => {
    onSelectCustomer(customerId);
    onClose();
  };

  return (
    <Modal title={t('select_customer')} onClose={onClose} size="lg">
      <div className="p-4 space-y-4">
        <div className="relative">
          <SearchIcon className="absolute top-1/2 -translate-y-1/2 ltr:left-3 rtl:right-3 text-muted-foreground" />
          <input
            type="text"
            placeholder={t('search_for_customers')}
            className="w-full p-2 ltr:pl-10 rtl:pr-10 rounded-md bg-secondary border-border focus:ring-primary focus:border-primary"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            autoFocus
          />
        </div>
        <div className="max-h-96 overflow-y-auto">
          {filteredCustomers.length > 0 ? (
            <ul className="divide-y divide-border">
              {filteredCustomers.map((customer) => (
                <li
                  key={customer.id}
                  className="p-3 flex justify-between items-center hover:bg-secondary cursor-pointer"
                  onClick={() => handleSelect(customer.id)}
                >
                  <div>
                    <p className="font-semibold">{customer.name}</p>
                    <p className="text-sm text-muted-foreground">{customer.phone}</p>
                  </div>
                  <button className="px-4 py-1 bg-primary text-primary-foreground text-sm rounded-md font-semibold">
                    {t('select')}
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-center text-muted-foreground p-8">{t('no_customers_found')}</p>
          )}
        </div>
      </div>
    </Modal>
  );
};