-- Access logs para hoje (2025-08-07)
INSERT INTO access_logs (client_id, device_id, store_id, access_type, method, success, action, status, details, created_at, timestamp) VALUES 
(17, 15, 10, 'entry', 'facial', true, 'access_granted', 'success', 'João Carlos Santos - Reconhecimento facial', '2025-08-07 08:30:15', '2025-08-07 08:30:15'),
(18, 15, 10, 'entry', 'facial', true, 'access_granted', 'success', 'Ana Paula Silva - Cliente VIP', '2025-08-07 09:45:22', '2025-08-07 09:45:22'),
(20, 15, 10, 'entry', 'facial', true, 'access_granted', 'success', 'Fernanda Oliveira - Acesso normal', '2025-08-07 10:15:30', '2025-08-07 10:15:30'),
(25, 15, 10, 'entry', 'facial', false, 'access_denied', 'failed', 'Lucas Barbosa - Falha no reconhecimento', '2025-08-07 11:20:45', '2025-08-07 11:20:45'),
(22, 15, 10, 'entry', 'facial', true, 'access_granted', 'success', 'Juliana Costa - Cliente VIP', '2025-08-07 14:30:12', '2025-08-07 14:30:12'),

-- Access logs para ontem (2025-08-06)
(19, 15, 10, 'entry', 'facial', true, 'access_granted', 'success', 'Carlos Eduardo Lima - Status amarelo', '2025-08-06 07:45:00', '2025-08-06 07:45:00'),
(26, 15, 10, 'entry', 'facial', true, 'access_granted', 'success', 'Carla Mendes - Cliente VIP', '2025-08-06 09:15:30', '2025-08-06 09:15:30'),
(23, 15, 10, 'entry', 'facial', true, 'access_granted', 'success', 'Pedro Henrique - Acesso matinal', '2025-08-06 10:30:45', '2025-08-06 10:30:45'),
(24, 15, 10, 'entry', 'facial', false, 'access_denied', 'failed', 'Mariana Rocha - Cliente em atenção', '2025-08-06 11:45:20', '2025-08-06 11:45:20'),
(17, 15, 10, 'entry', 'facial', true, 'access_granted', 'success', 'João Carlos Santos - Segunda visita', '2025-08-06 15:20:10', '2025-08-06 15:20:10'),
(18, 15, 10, 'entry', 'facial', true, 'access_granted', 'success', 'Ana Paula Silva - Tarde', '2025-08-06 16:45:35', '2025-08-06 16:45:35'),

-- Access logs para 2 dias atrás (2025-08-05)
(20, 15, 10, 'entry', 'facial', true, 'access_granted', 'success', 'Fernanda Oliveira - Manhã', '2025-08-05 08:20:15', '2025-08-05 08:20:15'),
(25, 15, 10, 'entry', 'facial', true, 'access_granted', 'success', 'Lucas Barbosa - Funcionou hoje', '2025-08-05 09:35:40', '2025-08-05 09:35:40'),
(21, 15, 10, 'entry', 'facial', false, 'access_denied', 'blocked', 'Roberto Almeida - Cliente bloqueado', '2025-08-05 10:15:25', '2025-08-05 10:15:25'),
(22, 15, 10, 'entry', 'facial', true, 'access_granted', 'success', 'Juliana Costa - VIP manhã', '2025-08-05 11:45:50', '2025-08-05 11:45:50'),
(19, 15, 10, 'entry', 'facial', true, 'access_granted', 'success', 'Carlos Eduardo Lima - Tarde', '2025-08-05 14:20:30', '2025-08-05 14:20:30'),
(26, 15, 10, 'entry', 'facial', true, 'access_granted', 'success', 'Carla Mendes - Final do dia', '2025-08-05 17:30:45', '2025-08-05 17:30:45');

-- Access logs para 3 dias atrás (2025-08-04)
INSERT INTO access_logs (client_id, device_id, store_id, access_type, method, success, action, status, details, created_at, timestamp) VALUES 
(17, 15, 10, 'entry', 'facial', true, 'access_granted', 'success', 'João Carlos Santos - Domingo', '2025-08-04 09:00:00', '2025-08-04 09:00:00'),
(18, 15, 10, 'entry', 'facial', true, 'access_granted', 'success', 'Ana Paula Silva - Fim de semana VIP', '2025-08-04 10:30:15', '2025-08-04 10:30:15'),
(23, 15, 10, 'entry', 'facial', true, 'access_granted', 'success', 'Pedro Henrique - Domingo manhã', '2025-08-04 11:15:30', '2025-08-04 11:15:30'),
(24, 15, 10, 'entry', 'facial', true, 'access_granted', 'success', 'Mariana Rocha - Resolvido atenção', '2025-08-04 15:45:20', '2025-08-04 15:45:20'),
(26, 15, 10, 'entry', 'facial', true, 'access_granted', 'success', 'Carla Mendes - Domingo tarde', '2025-08-04 16:20:45', '2025-08-04 16:20:45'),

-- Access logs para 4 dias atrás (2025-08-03)
(20, 15, 10, 'entry', 'facial', true, 'access_granted', 'success', 'Fernanda Oliveira - Sábado', '2025-08-03 08:45:00', '2025-08-03 08:45:00'),
(25, 15, 10, 'entry', 'facial', false, 'access_denied', 'failed', 'Lucas Barbosa - Falha sábado', '2025-08-03 09:30:15', '2025-08-03 09:30:15'),
(22, 15, 10, 'entry', 'facial', true, 'access_granted', 'success', 'Juliana Costa - VIP sábado', '2025-08-03 10:15:30', '2025-08-03 10:15:30'),
(19, 15, 10, 'entry', 'facial', true, 'access_granted', 'success', 'Carlos Eduardo Lima - Weekend', '2025-08-03 14:00:45', '2025-08-03 14:00:45'),
(17, 15, 10, 'entry', 'facial', true, 'access_granted', 'success', 'João Carlos Santos - Sábado tarde', '2025-08-03 15:30:20', '2025-08-03 15:30:20'),
(21, 15, 10, 'entry', 'facial', false, 'access_denied', 'blocked', 'Roberto Almeida - Tentativa bloqueado', '2025-08-03 16:45:00', '2025-08-03 16:45:00'),

-- Access logs para 5 dias atrás (2025-08-02)
(18, 15, 10, 'entry', 'facial', true, 'access_granted', 'success', 'Ana Paula Silva - Sexta VIP', '2025-08-02 07:30:00', '2025-08-02 07:30:00'),
(23, 15, 10, 'entry', 'facial', true, 'access_granted', 'success', 'Pedro Henrique - Sexta manhã', '2025-08-02 08:45:15', '2025-08-02 08:45:15'),
(26, 15, 10, 'entry', 'facial', true, 'access_granted', 'success', 'Carla Mendes - Sexta cedo', '2025-08-02 09:15:30', '2025-08-02 09:15:30'),
(24, 15, 10, 'entry', 'facial', false, 'access_denied', 'failed', 'Mariana Rocha - Falha sexta', '2025-08-02 10:30:45', '2025-08-02 10:30:45'),
(20, 15, 10, 'entry', 'facial', true, 'access_granted', 'success', 'Fernanda Oliveira - Meio da manhã', '2025-08-02 11:20:00', '2025-08-02 11:20:00'),
(25, 15, 10, 'entry', 'facial', true, 'access_granted', 'success', 'Lucas Barbosa - Sexta funcionou', '2025-08-02 14:15:30', '2025-08-02 14:15:30'),
(19, 15, 10, 'entry', 'facial', true, 'access_granted', 'success', 'Carlos Eduardo Lima - Tarde sexta', '2025-08-02 15:45:45', '2025-08-02 15:45:45'),
(22, 15, 10, 'entry', 'facial', true, 'access_granted', 'success', 'Juliana Costa - Final sexta VIP', '2025-08-02 17:00:20', '2025-08-02 17:00:20');
