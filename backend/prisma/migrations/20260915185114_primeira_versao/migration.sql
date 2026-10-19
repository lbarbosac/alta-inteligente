-- AlterTable
ALTER TABLE `pacientes` ADD COLUMN `anonimizado_em` DATETIME(3) NULL;

-- AlterTable
ALTER TABLE `profissionais` ADD COLUMN `alertas_email` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `hora_lembrete` VARCHAR(5) NOT NULL DEFAULT '09:00',
    ADD COLUMN `termos_aceitos_em` DATETIME(3) NULL,
    ADD COLUMN `termos_versao` VARCHAR(20) NULL;

-- CreateTable
CREATE TABLE `fotos_checkin` (
    `id` VARCHAR(191) NOT NULL,
    `checkin_id` VARCHAR(191) NOT NULL,
    `arquivo` VARCHAR(255) NOT NULL,
    `tamanho_bytes` INTEGER NOT NULL,
    `criado_em` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `fotos_checkin_checkin_id_idx`(`checkin_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `consentimentos_paciente` (
    `id` VARCHAR(191) NOT NULL,
    `tratamento_id` VARCHAR(191) NOT NULL,
    `versao_termo` VARCHAR(20) NOT NULL,
    `aceita_lembretes` BOOLEAN NOT NULL,
    `ip` VARCHAR(45) NULL,
    `user_agent` VARCHAR(255) NULL,
    `aceito_em` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `consentimentos_paciente_tratamento_id_idx`(`tratamento_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `notificacoes` (
    `id` VARCHAR(191) NOT NULL,
    `tipo` ENUM('lembrete_checkin', 'alerta_dor') NOT NULL,
    `canal` ENUM('email', 'whatsapp') NOT NULL,
    `status` ENUM('enviada', 'simulada', 'falhou') NOT NULL,
    `referencia` VARCHAR(120) NOT NULL,
    `tratamento_id` VARCHAR(191) NULL,
    `erro` TEXT NULL,
    `criado_em` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `notificacoes_referencia_key`(`referencia`),
    INDEX `notificacoes_tratamento_id_idx`(`tratamento_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `registros_acesso` (
    `id` VARCHAR(191) NOT NULL,
    `ator_tipo` ENUM('profissional', 'admin', 'paciente', 'sistema') NOT NULL,
    `ator_id` VARCHAR(36) NULL,
    `acao` VARCHAR(60) NOT NULL,
    `entidade` VARCHAR(40) NOT NULL,
    `entidade_id` VARCHAR(36) NULL,
    `ip` VARCHAR(45) NULL,
    `criado_em` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `registros_acesso_entidade_entidade_id_idx`(`entidade`, `entidade_id`),
    INDEX `registros_acesso_ator_id_idx`(`ator_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tokens_redefinicao_senha` (
    `id` VARCHAR(191) NOT NULL,
    `token_hash` CHAR(64) NOT NULL,
    `perfil` ENUM('admin', 'profissional') NOT NULL,
    `usuario_id` VARCHAR(36) NOT NULL,
    `expira_em` DATETIME(3) NOT NULL,
    `usado_em` DATETIME(3) NULL,
    `criado_em` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `tokens_redefinicao_senha_token_hash_key`(`token_hash`),
    INDEX `tokens_redefinicao_senha_usuario_id_idx`(`usuario_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `fotos_checkin` ADD CONSTRAINT `fotos_checkin_checkin_id_fkey` FOREIGN KEY (`checkin_id`) REFERENCES `checkins`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `consentimentos_paciente` ADD CONSTRAINT `consentimentos_paciente_tratamento_id_fkey` FOREIGN KEY (`tratamento_id`) REFERENCES `tratamentos`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notificacoes` ADD CONSTRAINT `notificacoes_tratamento_id_fkey` FOREIGN KEY (`tratamento_id`) REFERENCES `tratamentos`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
