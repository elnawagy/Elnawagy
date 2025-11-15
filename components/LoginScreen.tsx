import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useLocalization } from '../hooks/useLocalization';
import { useNotifications } from '../hooks/useNotifications';

export const LoginScreen: React.FC = () => {
    const { login } = useAuth();
    const { t } = useLocalization();
    const { addNotification } = useNotifications();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [userType, setUserType] = useState<'admin' | 'employee'>('admin');
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        const success = await login(email, password, userType);
        if (!success) {
            addNotification(t('invalid_credentials'), 'error');
        }
        setIsLoading(false);
    };

    const setManagerDemo = () => {
        setEmail('manager@system.com');
        setPassword('password');
        setUserType('admin');
    };

    const setEmployeeDemo = () => {
        setEmail('ahmed.mahmoud@example.com');
        setPassword('password');
        setUserType('employee');
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-secondary p-4">
            <div className="w-full max-w-md">
                <div className="bg-card border border-border rounded-2xl shadow-xl p-8">
                    <h1 className="text-2xl font-bold text-center text-primary">{t('welcome_to')}</h1>
                    <h2 className="text-xl font-semibold text-center text-foreground mb-6">{t('system_name')}</h2>
                    <form onSubmit={handleLogin} className="space-y-6">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-muted-foreground">{t('email')}</label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="mt-1 block w-full bg-background border-border rounded-md shadow-sm p-3 focus:ring-primary focus:border-primary"
                                placeholder="name@example.com"
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-muted-foreground">{t('password')}</label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="mt-1 block w-full bg-background border-border rounded-md shadow-sm p-3 focus:ring-primary focus:border-primary"
                                placeholder="••••••••"
                            />
                        </div>
                         <div className="flex items-center justify-center gap-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="radio" name="userType" value="admin" checked={userType === 'admin'} onChange={() => setUserType('admin')} className="form-radio h-4 w-4 text-primary focus:ring-primary" />
                                <span className="text-sm">{t('login_as_manager')}</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="radio" name="userType" value="employee" checked={userType === 'employee'} onChange={() => setUserType('employee')} className="form-radio h-4 w-4 text-primary focus:ring-primary" />
                                <span className="text-sm">{t('login_as_employee')}</span>
                            </label>
                        </div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-3 px-4 bg-primary text-primary-foreground font-bold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                        >
                            {isLoading ? `${t('login')}...` : t('login')}
                        </button>
                    </form>
                </div>
                 <div className="mt-4 text-center text-sm text-muted-foreground">
                    <p>Demo accounts:</p>
                    <button onClick={setManagerDemo} className="underline mx-2">Manager</button> |
                    <button onClick={setEmployeeDemo} className="underline mx-2">Employee</button>
                </div>
            </div>
        </div>
    );
};
