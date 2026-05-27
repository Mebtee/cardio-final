-- Insert Sample Data into Cardiomegaly Detection System Database
-- This script inserts the data from heartsight_ai(2).sql into the new database
-- Run this after setting up the database structure

USE cardiomegaly_detection;

-- Insert users (updating email domains to cardiomegaly.com)
INSERT INTO `users` (`id`, `username`, `password`, `email`, `role`, `full_name`, `created_at`, `specialty`, `is_banned`) VALUES
(1, 'admin', '$2b$12$AVoWfnOZQSVXL4JRtFxOKuGsZVAtQt5QNTKJM1c8Ot/vXQu6YScw2', 'admin@cardiomegaly.com', 'admin', 'System Administrator', '2025-11-11 19:14:21', NULL, 0),
(2, 'doctor1', '$2b$12$zVL/XZr7b1hRVcWK2wqkUudpwdfEgsU1hjkTUwjXFuW/zOr8vNa5C', 'doctor1@cardiomegaly.com', 'doctor', 'Dr. John Smith', '2025-11-11 19:14:21', 'cardiology', 0),
(3, 'technician1', '$2b$12$s1DKkEmSt5Pm36NuSsz30e03ZGA6u7KBWXnFBNjSukaofy/lJ49uq', 'tech1@cardiomegaly.com', 'xray_technician', 'Jane Doe', '2025-11-11 19:14:21', NULL, 0),
(4, 'rrr', '$2b$12$bEUbgACfiuIAvFcjpmUmk.TlTSms5K3arPMUHAd3BRkXixUT/bPCS', 'r@g.com', 'doctor', 'dsad', '2025-11-11 20:20:51', NULL, 0),
(5, 'bbb', '$2b$12$Cj0mivi.rUlfcJ6UXpgQCOEcPgICeUmuj3uthUeTbS9Y7azc1WRDi', 'b@g.com', 'doctor', 'dddd', '2025-11-11 20:31:42', NULL, 0),
(6, 'rec', '$2b$12$OyTrfg8ZXx65vYKjZjodieOn46Dl7/XeiNmz3lAjAG/VyQvY8oy0S', 'recep@gmail.com', 'reception', 'rec', '2025-11-12 19:13:29', NULL, 0),
(7, 'gen', '$2b$12$Riv8svlFDdAzRUGz2WEtCe4NKqKTplJdpXHM8wPl/JpHzlzlaqq52', 'gen@gmail.com', 'general_doctor', 'olansa sufa', '2025-11-12 19:14:39', NULL, 0),
(8, 'yohan', '$2b$12$Xh5sEEzN76PFLrHVNSSBH.9I.H7SzU1XbplSkRpulc4mmMYGmnQwO', 'yohannestekalign182@gmail.com', 'doctor', 'yohannestekalign', '2025-12-04 20:37:34', 'cardiology', 0),
(9, 'doctor2', '$2b$12$/dGIZ.RQlpcdqb72W7rKiOEXYAlPh.5MDdvrXuO16vpF3KQbjMC5K', 'doctor2@g.com', 'doctor', 'safd', '2025-12-13 07:08:48', 'cardiology', 1)
ON DUPLICATE KEY UPDATE
username = VALUES(username),
password = VALUES(password),
email = VALUES(email),
role = VALUES(role),
full_name = VALUES(full_name),
specialty = VALUES(specialty),
is_banned = VALUES(is_banned);

-- Insert patients
INSERT INTO `patients` (`id`, `patient_name`, `patient_id`, `contact_number`, `age`, `gender`, `medical_history`, `registered_by`, `status`, `referred_to`, `created_at`) VALUES
(1, 'abebe', NULL, '0911223344', 20, 'male', 'non', 6, 'referred', 2, '2025-11-12 19:14:12'),
(2, 'chala', '10023', '0911223355', 55, 'male', 'none', 6, 'xray_requested', 2, '2025-11-25 07:37:58'),
(3, 'abebe', '456', '09233232', 44, 'male', 'dgsfd', 6, 'xray_requested', 2, '2025-12-02 21:30:01'),
(4, 'chala', '425q4', '33', 33, 'female', '', 6, 'xray_requested', 2, '2025-12-02 21:30:18'),
(5, 'abeeb', 'PAT0001', 'gfg', 43, 'male', '', 6, 'registered', NULL, '2025-12-13 07:05:29'),
(6, 'viking', 'PAT0002', '0911223348', 7, 'male', '', 6, 'registered', NULL, '2025-12-13 12:59:19')
ON DUPLICATE KEY UPDATE
patient_name = VALUES(patient_name),
patient_id = VALUES(patient_id),
contact_number = VALUES(contact_number),
age = VALUES(age),
gender = VALUES(gender),
medical_history = VALUES(medical_history),
status = VALUES(status),
referred_to = VALUES(referred_to);

-- Insert xray_requests
INSERT INTO `xray_requests` (`id`, `doctor_id`, `patient_name`, `patient_id`, `request_notes`, `status`, `created_at`) VALUES
('req-044ae7e2-1052-4d24-a1c9-c10606a6', 2, 'chala', '425q4', '', 'completed', '2025-12-02 21:49:39'),
('req-0c3f4b6f-ac5e-4ac9-a2ca-1b7ef1b8', 2, 'abebe', '456', 'dgsfd', 'pending', '2025-12-13 07:06:49'),
('req-12ad64ac-9147-46f6-b6ad-111d859c', 2, 'chala', '425q4', '', 'pending', '2025-12-02 21:49:39'),
('req-146aba36-3e88-4dd6-bf2c-4e9c26b9', 2, 'abebe', '456', 'dgsfd', 'completed', '2025-12-03 17:23:58'),
('req-19cca446-27b5-4205-8ee3-ba81785a', 2, 'abebe', NULL, 'non', 'completed', '2025-12-02 21:49:43'),
('req-1c3d48fc-3615-4b9b-a669-1360c9ce', 2, 'abebe', '456', 'dgsfd', 'completed', '2025-12-03 19:27:44'),
('req-1f5ef99e-2f8d-443c-8b1b-e1f5dd4a', 2, 'chala', '425q4', '', 'completed', '2025-12-03 17:19:50'),
('req-22de4f11-7189-4d78-9f38-bd7eb7eb', 2, 'chala', '425q4', '', 'completed', '2025-12-02 21:49:39'),
('req-278b1dc4-fa80-49ab-8e62-d232b452', 2, 'chala', '10023', 'none', 'completed', '2025-12-03 17:23:56'),
('req-31770db9-a9d8-45c3-bde9-d4c2fc19', 2, 'abebe', '456', 'dgsfd', 'completed', '2025-12-03 19:27:44'),
('req-3813b520-1f23-4fbd-9f14-d74ca2b8', 2, 'abebe', NULL, 'non', 'completed', '2025-11-12 19:15:42'),
('req-3b24f74e-94e5-4cb7-8546-671111a8', 2, 'abebe', '456', 'dgsfd', 'pending', '2025-12-03 19:27:44'),
('req-3db9c503-d5e8-41fd-a36f-a10618a8', 2, 'abebe', '456', 'dgsfd', 'completed', '2025-12-02 21:48:37'),
('req-5239dff5-025d-4197-aeaf-b233a3d9', 2, 'chala', '425q4', '', 'completed', '2025-12-02 21:49:39'),
('req-53dde764-3c62-42f2-b954-953a5fc2', 2, 'abebe', '456', 'dgsfd', 'completed', '2025-12-02 21:49:41'),
('req-5b25d61d-91d0-4b29-bcb6-c3367bda', 2, 'chala', '425q4', '', 'completed', '2025-12-03 17:24:00'),
('req-67eb72f0-5742-4e74-b37e-9850cdbd', 2, 'abebe', '456', 'dgsfd', 'completed', '2025-12-03 19:27:45'),
('req-68d5d0f6-8000-488b-9bf2-3fb5cf7e', 2, 'chala', '425q4', '', 'completed', '2025-12-02 21:35:10'),
('req-6ef47313-cd97-4712-bf81-38be67b6', 2, 'chala', '10023', 'none', 'completed', '2025-12-02 21:49:42'),
('req-7f385a43-1b56-4bd0-bc67-c50aa0a2', 2, 'chala', '425q4', '', 'completed', '2025-12-02 21:48:35'),
('req-8ab6f6bd-519f-460e-a6af-8847b185', 2, 'chala', '425q4', '', 'completed', '2025-12-03 17:19:49'),
('req-8ba74451-7b64-4ef4-9e18-e4a305db', 2, 'chala', '425q4', '', 'completed', '2025-12-03 17:22:44'),
('req-8d004bfd-7156-429a-a402-e1ce502c', 2, 'chala', '425q4', '', 'completed', '2025-12-03 17:23:59'),
('req-8de8406b-4d3a-4c06-9eb6-e3303150', 2, 'abebe', '456', 'dgsfd', 'completed', '2025-12-02 21:49:41'),
('req-981fe755-e920-4adb-b0f3-d3cc5cf9', 2, 'chala', '425q4', '', 'completed', '2025-12-03 17:23:59'),
('req-9ace9b24-ed5e-43dc-941d-ef193062', 2, 'chala', '10023', 'none', 'pending', '2025-12-13 07:06:49'),
('req-9edf4007-359f-4072-b08f-05e3ce31', 2, 'chala', '425q4', '', 'completed', '2025-12-02 21:33:00'),
('req-aa6fdb5b-d471-4e8e-916b-90a41878', 2, 'chala', '425q4', '', 'completed', '2025-12-03 17:19:46'),
('req-b24aca85-5b67-41ea-8e9a-ad5ae9d3', 2, 'chala', '425q4', '', 'completed', '2025-12-12 14:27:30'),
('req-c7a9aea0-a100-4394-853b-acbf070a', 2, 'abebe', '456', 'dgsfd', 'pending', '2025-12-03 19:27:44'),
('req-e377e4ba-bb7c-47ae-b793-739a0d2d', 2, 'chala', '425q4', '', 'completed', '2025-12-02 21:35:12'),
('req-ef7eb2b0-5a82-4d50-a033-0b4c1cfc', 2, 'abebe', '456', 'dgsfd', 'completed', '2025-12-02 21:49:41')
ON DUPLICATE KEY UPDATE
doctor_id = VALUES(doctor_id),
patient_name = VALUES(patient_name),
patient_id = VALUES(patient_id),
request_notes = VALUES(request_notes),
status = VALUES(status);

-- Insert predictions
INSERT INTO `predictions` (`id`, `request_id`, `filename`, `prediction`, `confidence`, `timestamp`) VALUES
('0c3ba9d0-a4b5-4ae6-be86-a3ae1f4e8114', 'req-68d5d0f6-8000-488b-9bf2-3fb5cf7e', '80.jpg', 'positive', 0.905966, '2025-12-03 00:39:30'),
('138015e5-a02f-4a27-9b65-dc14a7ee759b', 'req-6ef47313-cd97-4712-bf81-38be67b6', '74.jpg', 'negative', 0.974926, '2025-12-03 00:50:18'),
('19116ffb-8797-4243-8238-35c63b350549', 'req-31770db9-a9d8-45c3-bde9-d4c2fc19', 'r2.jpg', 'negative', 0.979273, '2025-12-03 23:26:56'),
('21aaa9e1-e995-43a0-b9d2-eddc6f383c34', 'req-8ab6f6bd-519f-460e-a6af-8847b185', 'a1.jpg', 'positive', 0.941688, '2025-12-03 20:21:41'),
('3529dc61-1580-41ed-b9ed-7f7d4fe87f72', 'req-e377e4ba-bb7c-47ae-b793-739a0d2d', '140.jpg', 'negative', 0.736331, '2025-12-03 00:35:27'),
('41e085f2-9e71-4b9e-a7bf-3b8e268006d3', 'req-044ae7e2-1052-4d24-a1c9-c10606a6', '690.jpg', 'negative', 0.999674, '2025-12-03 00:51:25'),
('4470ea85-60c7-4f9d-a0f3-0a5b8c7974c9', 'req-278b1dc4-fa80-49ab-8e62-d232b452', 'r4.jpg', 'negative', 0.999914, '2025-12-03 22:26:03'),
('477af68c-c485-4c20-b275-572565a00e1e', 'req-7f385a43-1b56-4bd0-bc67-c50aa0a2', '160.jpg', 'negative', 0.999988, '2025-12-03 00:49:32'),
('59b52c79-d20b-4f67-9a38-efc9c877f83f', 'req-5239dff5-025d-4197-aeaf-b233a3d9', 'a1.jpg', 'positive', 0.941688, '2025-12-03 23:26:30'),
('62fafeb5-24ad-411e-a1c4-a6c949b4fea9', 'req-53dde764-3c62-42f2-b954-953a5fc2', '53.jpg', 'positive', 0.992235, '2025-12-03 00:50:43'),
('7862b28d-c30b-4f94-8ad2-027909f739b9', 'req-67eb72f0-5742-4e74-b37e-9850cdbd', 'r5.jpg', 'positive', 0.838307, '2025-12-03 22:27:58'),
('79800bc1-5f4d-41b1-9a8e-0512b80c7134', 'req-ef7eb2b0-5a82-4d50-a033-0b4c1cfc', '8.jpg', 'positive', 0.657251, '2025-12-03 00:51:11'),
('7de112b8-e02b-4767-8e71-6b28f06685a0', 'req-3db9c503-d5e8-41fd-a36f-a10618a8', '140.jpg', 'negative', 0.999688, '2025-12-03 00:49:22'),
('81267237-8089-451d-97d0-73ebde67fd5e', 'req-8d004bfd-7156-429a-a402-e1ce502c', 'l1.jpg', 'negative', 0.999193, '2025-12-03 20:24:23'),
('9480a9a2-a11b-4ac3-98d5-c3c66b71984a', 'req-b24aca85-5b67-41ea-8e9a-ad5ae9d3', 'a2.jpg', 'positive', 0.995261, '2025-12-12 17:28:17'),
('a2394e45-04a3-4fc4-949b-fc9c08991da8', 'req-1f5ef99e-2f8d-443c-8b1b-e1f5dd4a', 'charger.jpg', 'positive', 0.713557, '2025-12-03 20:20:34'),
('a6a20d00-fb32-4da5-a1ac-b158480d0dac', 'req-1c3d48fc-3615-4b9b-a669-1360c9ce', 'r5.jpg', 'positive', 0.838307, '2025-12-03 22:28:09'),
('b1ecb041-0ac2-4cd7-998b-23785643b19f', 'req-aa6fdb5b-d471-4e8e-916b-90a41878', 'a2.jpg', 'positive', 0.995261, '2025-12-03 20:22:17'),
('b7c0b29f-fa82-4db3-91fb-ceddeeb59bed', 'req-3813b520-1f23-4fbd-9f14-d74ca2b8', 'Gemini_Generated_Image_zge36tzge36tzge3.png', 'negative', 0.85498, '2025-11-12 22:16:15'),
('b8ccb677-be84-484e-af04-57028d4027b4', 'req-8ba74451-7b64-4ef4-9e18-e4a305db', 'n1.jpg', 'negative', 0.998461, '2025-12-03 20:22:57'),
('c39df9cd-5bc7-40f4-82ef-b86104976653', 'req-19cca446-27b5-4205-8ee3-ba81785a', '2.jpg', 'positive', 0.97801, '2025-12-03 00:50:07'),
('d05a7695-4f30-4013-a97a-adb931ceff53', 'req-981fe755-e920-4adb-b0f3-d3cc5cf9', 'r3.jpg', 'negative', 0.82336, '2025-12-03 22:24:55'),
('d776fbc0-b2aa-441b-a9c4-3d973b787655', 'req-5b25d61d-91d0-4b29-bcb6-c3367bda', 'l1.jpg', 'negative', 0.999193, '2025-12-03 20:24:12'),
('e9db8de0-bb46-444d-9a58-6a5683ef50c5', 'req-9edf4007-359f-4072-b08f-05e3ce31', '20.jpg', 'positive', 0.862221, '2025-12-02 21:33:29'),
('edbbae42-f340-4f35-8852-6321e3b27199', 'req-146aba36-3e88-4dd6-bf2c-4e9c26b9', 'a1.jpg', 'positive', 0.941688, '2025-12-03 22:18:54'),
('ef4909f1-fd1a-4cda-9e92-cb85885fd2e0', 'req-22de4f11-7189-4d78-9f38-bd7eb7eb', 'r2.jpg', 'negative', 0.979273, '2025-12-03 22:23:15'),
('fb8b3b2c-97fd-4eb1-bdb2-35314c984b97', 'req-8de8406b-4d3a-4c06-9eb6-e3303150', '43.jpg', 'positive', 0.9702, '2025-12-03 00:50:54')
ON DUPLICATE KEY UPDATE
request_id = VALUES(request_id),
filename = VALUES(filename),
prediction = VALUES(prediction),
confidence = VALUES(confidence),
timestamp = VALUES(timestamp);

-- Insert password_reset_tokens
INSERT INTO `password_reset_tokens` (`id`, `user_id`, `token`, `expires_at`, `used`, `created_at`) VALUES
(1, 8, 'ZY5vff8XpB68aYItbQd2BPH6xc5T4aY-mA1aiB5MRGI', '2025-12-06 15:27:26', 1, '2025-12-06 11:27:26'),
(2, 8, 'Hv3nCxp4yrm0Cp6qd67VY9Rnu0kw7XrV1DN7yUsxa48', '2025-12-06 15:28:29', 1, '2025-12-06 11:28:29'),
(3, 8, '7ZE0QI54rJOSIaS97sBIDIw6l97t-MsCjGSI0TreKLg', '2025-12-06 15:30:12', 1, '2025-12-06 11:30:12'),
(4, 8, 'NUBtjbxh9xt0jERBuhEWD3b5VuRVU7lNvsDX8Qg5TKc', '2025-12-06 15:31:43', 1, '2025-12-06 11:31:43'),
(5, 8, 'UpQ7c2DrvhDT9SEg4xZ158ozFEKjDtSsbFuQXLGpFV0', '2025-12-06 15:35:12', 1, '2025-12-06 11:35:12'),
(6, 8, 'PlV-43mecyL-7Sv1HUZNuFyn2RmV11-XsZC444Xho5Y', '2025-12-06 15:38:51', 1, '2025-12-06 11:38:51'),
(7, 8, 'j1qltJ40_X4clq09jyWopV9jrhQro_aP_6jY95wW2Y0', '2025-12-06 17:55:03', 1, '2025-12-06 13:55:03'),
(8, 8, '2n5cOnjDqHX9TIoop8WBBk6yBQxVrzaAH9NZXT0vouc', '2025-12-13 11:25:06', 1, '2025-12-13 07:25:06'),
(9, 8, 'TvBNvr-D1MaeaTvWmQm7q4_BbXIjj5DNmzLztEZz5qY', '2025-12-13 11:29:43', 1, '2025-12-13 07:29:43'),
(10, 8, 'QNxzhBPPOOBfKvlKGXSp5j2Bc4P32XhD-1Uy0EWwoVE', '2025-12-13 11:38:53', 1, '2025-12-13 07:38:53'),
(11, 8, 'EEcawT4uyhKmZ1NvDEd75IFhqJhndtCl9B4desARGOc', '2025-12-13 11:40:07', 1, '2025-12-13 07:40:07')
ON DUPLICATE KEY UPDATE
user_id = VALUES(user_id),
token = VALUES(token),
expires_at = VALUES(expires_at),
used = VALUES(used);

-- Insert patient_edit_requests
INSERT INTO `patient_edit_requests` (`id`, `patient_id`, `requested_by`, `request_reason`, `status`, `original_data`, `proposed_changes`, `reviewed_by`, `review_notes`, `created_at`, `approved_at`, `submitted_at`, `final_approved_at`) VALUES
(1, 6, 6, 'the name is incorrect', 'approved_final', '{\"patient_name\": \"jhgf\", \"contact_number\": \"0911223348\", \"age\": 7, \"gender\": \"male\", \"medical_history\": \"\"}', '{\"patient_name\": \"bolale\", \"contact_number\": \"0911223348\", \"age\": 7, \"gender\": \"male\", \"medical_history\": \"\"}', 1, '', '2025-12-13 14:21:26', '2025-12-13 14:21:38', '2025-12-13 14:29:24', '2025-12-13 14:29:42'),
(2, 6, 6, 'name', 'approved_final', '{\"patient_name\": \"bolale\", \"contact_number\": \"0911223348\", \"age\": 7, \"gender\": \"male\", \"medical_history\": \"\"}', '{\"patient_name\": \"viking\", \"contact_number\": \"0911223348\", \"age\": 7, \"gender\": \"male\", \"medical_history\": \"\"}', 1, '', '2025-12-13 14:37:09', '2025-12-13 14:37:19', '2025-12-13 14:37:38', '2025-12-13 14:38:59')
ON DUPLICATE KEY UPDATE
patient_id = VALUES(patient_id),
requested_by = VALUES(requested_by),
request_reason = VALUES(request_reason),
status = VALUES(status),
original_data = VALUES(original_data),
proposed_changes = VALUES(proposed_changes),
reviewed_by = VALUES(reviewed_by),
review_notes = VALUES(review_notes),
approved_at = VALUES(approved_at),
submitted_at = VALUES(submitted_at),
final_approved_at = VALUES(final_approved_at);

-- Insert notifications
INSERT INTO `notifications` (`id`, `user_id`, `type`, `title`, `message`, `related_id`, `is_read`, `created_at`) VALUES
(1, 3, 'xray_request', 'New X-ray Request', 'New X-ray request for patient chala (425q4) is pending.', 'req-b24aca85-5b67-41ea-8e9a-ad5ae9d3c0ee', 1, '2025-12-12 14:27:30'),
(2, 2, 'xray_result_ready', 'X-ray Result Ready', 'Result for patient chala (425q4): Positive for cardiomegaly (Confidence: 99.5%)', 'req-b24aca85-5b67-41ea-8e9a-ad5ae9d3', 1, '2025-12-12 14:28:17'),
(3, 7, 'patient_registered', 'New Patient Registered', 'Patient abeeb (PAT0001) has been registered and is awaiting triage.', '5', 0, '2025-12-13 07:05:29'),
(4, 3, 'xray_request', 'New X-ray Request', 'New X-ray request for patient abebe (456) is pending.', 'req-0c3f4b6f-ac5e-4ac9-a2ca-1b7ef1b8539b', 1, '2025-12-13 07:06:49'),
(5, 3, 'xray_request', 'New X-ray Request', 'New X-ray request for patient chala (10023) is pending.', 'req-9ace9b24-ed5e-43dc-941d-ef193062f04a', 1, '2025-12-13 07:06:49'),
(6, 7, 'patient_registered', 'New Patient Registered', 'Patient jhgf (PAT0002) has been registered and is awaiting triage.', '6', 0, '2025-12-13 12:59:19')
ON DUPLICATE KEY UPDATE
user_id = VALUES(user_id),
type = VALUES(type),
title = VALUES(title),
message = VALUES(message),
related_id = VALUES(related_id),
is_read = VALUES(is_read);

-- Reset AUTO_INCREMENT values to match the data
ALTER TABLE `notifications` AUTO_INCREMENT = 7;
ALTER TABLE `password_reset_tokens` AUTO_INCREMENT = 12;
ALTER TABLE `patients` AUTO_INCREMENT = 7;
ALTER TABLE `patient_edit_requests` AUTO_INCREMENT = 3;
ALTER TABLE `users` AUTO_INCREMENT = 10;

SELECT 'Sample data inserted successfully!' AS Status;
SELECT 'Users, patients, xray_requests, predictions, notifications, password_reset_tokens, and patient_edit_requests data loaded' AS Info;