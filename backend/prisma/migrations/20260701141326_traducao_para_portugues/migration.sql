/*
  Warnings:

  - You are about to drop the column `created_at` on the `checkins` table. All the data in the column will be lost.
  - You are about to drop the column `notes` on the `checkins` table. All the data in the column will be lost.
  - You are about to drop the column `pain_level` on the `checkins` table. All the data in the column will be lost.
  - You are about to drop the column `recovery_day` on the `checkins` table. All the data in the column will be lost.
  - You are about to drop the column `submitted_at` on the `checkins` table. All the data in the column will be lost.
  - You are about to drop the column `treatment_id` on the `checkins` table. All the data in the column will be lost.
  - You are about to drop the `administrators` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `checkin_task_responses` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `patient_sessions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `patients` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `professionals` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `protocol_day_tasks` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `protocol_days` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `protocol_versions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `protocols` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `treatments` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[tratamento_id,dia_recuperacao]` on the table `checkins` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `dia_recuperacao` to the `checkins` table without a default value. This is not possible if the table is not empty.
  - Added the required column `enviado_em` to the `checkins` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nivel_dor` to the `checkins` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tratamento_id` to the `checkins` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `checkin_task_responses` DROP FOREIGN KEY `checkin_task_responses_checkin_id_fkey`;

-- DropForeignKey
ALTER TABLE `checkin_task_responses` DROP FOREIGN KEY `checkin_task_responses_protocol_day_task_id_fkey`;

-- DropForeignKey
ALTER TABLE `checkins` DROP FOREIGN KEY `checkins_treatment_id_fkey`;

-- DropForeignKey
ALTER TABLE `patient_sessions` DROP FOREIGN KEY `patient_sessions_treatment_id_fkey`;

-- DropForeignKey
ALTER TABLE `patients` DROP FOREIGN KEY `patients_professional_id_fkey`;

-- DropForeignKey
ALTER TABLE `protocol_day_tasks` DROP FOREIGN KEY `protocol_day_tasks_protocol_day_id_fkey`;

-- DropForeignKey
ALTER TABLE `protocol_days` DROP FOREIGN KEY `protocol_days_protocol_version_id_fkey`;

-- DropForeignKey
ALTER TABLE `protocol_versions` DROP FOREIGN KEY `protocol_versions_protocol_id_fkey`;

-- DropForeignKey
ALTER TABLE `protocols` DROP FOREIGN KEY `protocols_professional_id_fkey`;

-- DropForeignKey
ALTER TABLE `treatments` DROP FOREIGN KEY `treatments_patient_id_fkey`;

-- DropForeignKey
ALTER TABLE `treatments` DROP FOREIGN KEY `treatments_protocol_version_id_fkey`;

-- DropIndex
DROP INDEX `checkins_treatment_id_recovery_day_key` ON `checkins`;

-- AlterTable
ALTER TABLE `checkins` DROP COLUMN `created_at`,
    DROP COLUMN `notes`,
    DROP COLUMN `pain_level`,
    DROP COLUMN `recovery_day`,
    DROP COLUMN `submitted_at`,
    DROP COLUMN `treatment_id`,
    ADD COLUMN `criado_em` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `dia_recuperacao` INTEGER NOT NULL,
    ADD COLUMN `enviado_em` DATETIME(3) NOT NULL,
    ADD COLUMN `nivel_dor` TINYINT NOT NULL,
    ADD COLUMN `observacoes` TEXT NULL,
    ADD COLUMN `tratamento_id` VARCHAR(191) NOT NULL;

-- DropTable
DROP TABLE `administrators`;

-- DropTable
DROP TABLE `checkin_task_responses`;

-- DropTable
DROP TABLE `patient_sessions`;

-- DropTable
DROP TABLE `patients`;

-- DropTable
DROP TABLE `professionals`;

-- DropTable
DROP TABLE `protocol_day_tasks`;

-- DropTable
DROP TABLE `protocol_days`;

-- DropTable
DROP TABLE `protocol_versions`;

-- DropTable
DROP TABLE `protocols`;

-- DropTable
DROP TABLE `treatments`;

-- CreateTable
CREATE TABLE `administradores` (
    `id` VARCHAR(191) NOT NULL,
    `nome` VARCHAR(120) NOT NULL,
    `email` VARCHAR(150) NOT NULL,
    `senha` VARCHAR(255) NOT NULL,
    `ativo` BOOLEAN NOT NULL DEFAULT true,
    `criado_em` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `atualizado_em` DATETIME(3) NOT NULL,

    UNIQUE INDEX `administradores_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `profissionais` (
    `id` VARCHAR(191) NOT NULL,
    `nome` VARCHAR(120) NOT NULL,
    `especialidade` VARCHAR(100) NOT NULL,
    `email` VARCHAR(150) NOT NULL,
    `telefone` VARCHAR(20) NOT NULL,
    `senha` VARCHAR(255) NOT NULL,
    `ativo` BOOLEAN NOT NULL DEFAULT true,
    `criado_em` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `atualizado_em` DATETIME(3) NOT NULL,

    UNIQUE INDEX `profissionais_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pacientes` (
    `id` VARCHAR(191) NOT NULL,
    `profissional_id` VARCHAR(191) NOT NULL,
    `nome` VARCHAR(120) NOT NULL,
    `data_nascimento` DATE NOT NULL,
    `telefone` VARCHAR(20) NOT NULL,
    `email` VARCHAR(150) NULL,
    `observacoes` TEXT NULL,
    `ativo` BOOLEAN NOT NULL DEFAULT true,
    `criado_em` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `atualizado_em` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `protocolos` (
    `id` VARCHAR(191) NOT NULL,
    `profissional_id` VARCHAR(191) NOT NULL,
    `nome` VARCHAR(150) NOT NULL,
    `descricao` TEXT NULL,
    `dias_padrao` INTEGER NOT NULL,
    `ativo` BOOLEAN NOT NULL DEFAULT true,
    `criado_em` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `atualizado_em` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `versoes_protocolo` (
    `id` VARCHAR(191) NOT NULL,
    `protocolo_id` VARCHAR(191) NOT NULL,
    `versao` INTEGER NOT NULL,
    `total_dias` INTEGER NOT NULL,
    `criado_em` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `dias_protocolo` (
    `id` VARCHAR(191) NOT NULL,
    `versao_protocolo_id` VARCHAR(191) NOT NULL,
    `numero_dia` INTEGER NOT NULL,
    `titulo` VARCHAR(150) NULL,
    `criado_em` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tarefas_dia_protocolo` (
    `id` VARCHAR(191) NOT NULL,
    `dia_protocolo_id` VARCHAR(191) NOT NULL,
    `descricao` TEXT NOT NULL,
    `numero_ordem` INTEGER NOT NULL,
    `criado_em` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tratamentos` (
    `id` VARCHAR(191) NOT NULL,
    `paciente_id` VARCHAR(191) NOT NULL,
    `versao_protocolo_id` VARCHAR(191) NOT NULL,
    `nome_procedimento` VARCHAR(150) NOT NULL,
    `data_procedimento` DATE NOT NULL,
    `status` ENUM('ativo', 'finalizado', 'cancelado') NOT NULL DEFAULT 'ativo',
    `token_paciente` CHAR(64) NOT NULL,
    `token_expira_em` DATETIME(3) NULL,
    `criado_em` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `atualizado_em` DATETIME(3) NOT NULL,

    UNIQUE INDEX `tratamentos_token_paciente_key`(`token_paciente`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `respostas_tarefa_checkin` (
    `id` VARCHAR(191) NOT NULL,
    `checkin_id` VARCHAR(191) NOT NULL,
    `tarefa_dia_protocolo_id` VARCHAR(191) NOT NULL,
    `concluido` BOOLEAN NOT NULL,
    `concluido_em` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sessoes_paciente` (
    `id` VARCHAR(191) NOT NULL,
    `tratamento_id` VARCHAR(191) NOT NULL,
    `token_sessao` CHAR(64) NOT NULL,
    `user_agent` VARCHAR(255) NULL,
    `expira_em` DATETIME(3) NOT NULL,
    `ultimo_acesso` DATETIME(3) NULL,
    `criado_em` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `sessoes_paciente_token_sessao_key`(`token_sessao`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `checkins_tratamento_id_dia_recuperacao_key` ON `checkins`(`tratamento_id`, `dia_recuperacao`);

-- AddForeignKey
ALTER TABLE `pacientes` ADD CONSTRAINT `pacientes_profissional_id_fkey` FOREIGN KEY (`profissional_id`) REFERENCES `profissionais`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `protocolos` ADD CONSTRAINT `protocolos_profissional_id_fkey` FOREIGN KEY (`profissional_id`) REFERENCES `profissionais`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `versoes_protocolo` ADD CONSTRAINT `versoes_protocolo_protocolo_id_fkey` FOREIGN KEY (`protocolo_id`) REFERENCES `protocolos`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `dias_protocolo` ADD CONSTRAINT `dias_protocolo_versao_protocolo_id_fkey` FOREIGN KEY (`versao_protocolo_id`) REFERENCES `versoes_protocolo`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tarefas_dia_protocolo` ADD CONSTRAINT `tarefas_dia_protocolo_dia_protocolo_id_fkey` FOREIGN KEY (`dia_protocolo_id`) REFERENCES `dias_protocolo`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tratamentos` ADD CONSTRAINT `tratamentos_paciente_id_fkey` FOREIGN KEY (`paciente_id`) REFERENCES `pacientes`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tratamentos` ADD CONSTRAINT `tratamentos_versao_protocolo_id_fkey` FOREIGN KEY (`versao_protocolo_id`) REFERENCES `versoes_protocolo`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `checkins` ADD CONSTRAINT `checkins_tratamento_id_fkey` FOREIGN KEY (`tratamento_id`) REFERENCES `tratamentos`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `respostas_tarefa_checkin` ADD CONSTRAINT `respostas_tarefa_checkin_checkin_id_fkey` FOREIGN KEY (`checkin_id`) REFERENCES `checkins`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `respostas_tarefa_checkin` ADD CONSTRAINT `respostas_tarefa_checkin_tarefa_dia_protocolo_id_fkey` FOREIGN KEY (`tarefa_dia_protocolo_id`) REFERENCES `tarefas_dia_protocolo`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sessoes_paciente` ADD CONSTRAINT `sessoes_paciente_tratamento_id_fkey` FOREIGN KEY (`tratamento_id`) REFERENCES `tratamentos`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
