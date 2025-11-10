-- Nettoyer tous les usernames existants (retirer espaces en début/fin)

-- Mettre à jour tous les usernames pour retirer les espaces
UPDATE profiles
SET username = TRIM(username)
WHERE username != TRIM(username);

-- Afficher les usernames qui ont été modifiés
SELECT username, user_id 
FROM profiles 
ORDER BY created_at DESC 
LIMIT 10;
