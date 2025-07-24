-- Migration pour supprimer le service d'email

-- Supprimer les paramètres du service d'email
DELETE FROM settings WHERE id = 'email_service_settings';

-- Mettre à jour les paramètres app_settings pour supprimer autoEmailEnabled
UPDATE settings 
SET data = data - 'autoEmailEnabled'
WHERE id = 'app_settings';