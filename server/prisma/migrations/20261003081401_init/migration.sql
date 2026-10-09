-- CreateTable
CREATE TABLE `users` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nama` VARCHAR(100) NOT NULL,
    `email` VARCHAR(150) NOT NULL,
    `password_hash` VARCHAR(100) NOT NULL,
    `role` ENUM('ADMIN', 'ARSITEK', 'KLIEN') NOT NULL,
    `telepon` VARCHAR(30) NULL,
    `aktif` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `users_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `packages` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `tingkatan` ENUM('BASIC', 'SILVER', 'PLATINUM') NOT NULL,
    `lingkup` ENUM('INTERIOR', 'EKSTERIOR', 'FULL') NOT NULL,
    `tarif_per_m2` INTEGER NOT NULL,
    `aktif` BOOLEAN NOT NULL DEFAULT true,

    UNIQUE INDEX `packages_tingkatan_lingkup_key`(`tingkatan`, `lingkup`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `package_features` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `package_id` INTEGER NOT NULL,
    `teks` VARCHAR(200) NOT NULL,
    `urutan` INTEGER NOT NULL DEFAULT 0,

    INDEX `package_features_package_id_idx`(`package_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `categories` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nama` VARCHAR(80) NOT NULL,
    `slug` VARCHAR(100) NOT NULL,

    UNIQUE INDEX `categories_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `portfolios` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `judul` VARCHAR(150) NOT NULL,
    `slug` VARCHAR(180) NOT NULL,
    `deskripsi` TEXT NULL,
    `lokasi` VARCHAR(120) NULL,
    `luas_m2` INTEGER NULL,
    `tahun` INTEGER NULL,
    `category_id` INTEGER NOT NULL,
    `package_id` INTEGER NULL,
    `unggulan` BOOLEAN NOT NULL DEFAULT false,
    `terbit` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `portfolios_slug_key`(`slug`),
    INDEX `portfolios_category_id_idx`(`category_id`),
    INDEX `portfolios_package_id_idx`(`package_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `portfolio_images` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `portfolio_id` INTEGER NOT NULL,
    `path` VARCHAR(255) NOT NULL,
    `alt` VARCHAR(200) NULL,
    `urutan` INTEGER NOT NULL DEFAULT 0,
    `sampul` BOOLEAN NOT NULL DEFAULT false,

    INDEX `portfolio_images_portfolio_id_idx`(`portfolio_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `projects` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nama` VARCHAR(150) NOT NULL,
    `deskripsi` TEXT NULL,
    `lokasi` VARCHAR(120) NULL,
    `luas_m2` INTEGER NULL,
    `package_id` INTEGER NULL,
    `client_id` INTEGER NOT NULL,
    `status` ENUM('AKTIF', 'SELESAI', 'DITUNDA') NOT NULL DEFAULT 'AKTIF',
    `progres` INTEGER NOT NULL DEFAULT 0,
    `tanggal_mulai` DATE NULL,
    `target_selesai` DATE NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `projects_client_id_idx`(`client_id`),
    INDEX `projects_package_id_idx`(`package_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `project_members` (
    `project_id` INTEGER NOT NULL,
    `user_id` INTEGER NOT NULL,
    `peran` VARCHAR(60) NOT NULL DEFAULT 'Arsitek',

    INDEX `project_members_user_id_idx`(`user_id`),
    PRIMARY KEY (`project_id`, `user_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `project_stages` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `project_id` INTEGER NOT NULL,
    `nama` VARCHAR(100) NOT NULL,
    `urutan` INTEGER NOT NULL,
    `status` ENUM('BELUM', 'BERJALAN', 'SELESAI') NOT NULL DEFAULT 'BELUM',
    `tanggal_mulai` DATE NULL,
    `tanggal_target` DATE NULL,
    `tanggal_selesai` DATE NULL,

    INDEX `project_stages_project_id_idx`(`project_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `project_files` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `project_id` INTEGER NOT NULL,
    `stage_id` INTEGER NULL,
    `nama` VARCHAR(150) NOT NULL,
    `path` VARCHAR(255) NOT NULL,
    `mime` VARCHAR(100) NOT NULL,
    `ukuran` INTEGER NOT NULL,
    `versi` INTEGER NOT NULL DEFAULT 1,
    `catatan_revisi` VARCHAR(300) NULL,
    `uploaded_by` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `project_files_project_id_idx`(`project_id`),
    INDEX `project_files_stage_id_idx`(`stage_id`),
    INDEX `project_files_uploaded_by_idx`(`uploaded_by`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `comments` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `project_id` INTEGER NOT NULL,
    `user_id` INTEGER NOT NULL,
    `parent_id` INTEGER NULL,
    `isi` TEXT NOT NULL,
    `jenis` ENUM('KOMENTAR', 'REVISI') NOT NULL DEFAULT 'KOMENTAR',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `comments_project_id_idx`(`project_id`),
    INDEX `comments_user_id_idx`(`user_id`),
    INDEX `comments_parent_id_idx`(`parent_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `notifications` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `project_id` INTEGER NULL,
    `pesan` VARCHAR(255) NOT NULL,
    `dibaca` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `notifications_user_id_dibaca_idx`(`user_id`, `dibaca`),
    INDEX `notifications_project_id_idx`(`project_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `package_features` ADD CONSTRAINT `package_features_package_id_fkey` FOREIGN KEY (`package_id`) REFERENCES `packages`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `portfolios` ADD CONSTRAINT `portfolios_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `portfolios` ADD CONSTRAINT `portfolios_package_id_fkey` FOREIGN KEY (`package_id`) REFERENCES `packages`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `portfolio_images` ADD CONSTRAINT `portfolio_images_portfolio_id_fkey` FOREIGN KEY (`portfolio_id`) REFERENCES `portfolios`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `projects` ADD CONSTRAINT `projects_client_id_fkey` FOREIGN KEY (`client_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `projects` ADD CONSTRAINT `projects_package_id_fkey` FOREIGN KEY (`package_id`) REFERENCES `packages`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `project_members` ADD CONSTRAINT `project_members_project_id_fkey` FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `project_members` ADD CONSTRAINT `project_members_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `project_stages` ADD CONSTRAINT `project_stages_project_id_fkey` FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `project_files` ADD CONSTRAINT `project_files_project_id_fkey` FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `project_files` ADD CONSTRAINT `project_files_stage_id_fkey` FOREIGN KEY (`stage_id`) REFERENCES `project_stages`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `project_files` ADD CONSTRAINT `project_files_uploaded_by_fkey` FOREIGN KEY (`uploaded_by`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `comments` ADD CONSTRAINT `comments_project_id_fkey` FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `comments` ADD CONSTRAINT `comments_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `comments` ADD CONSTRAINT `comments_parent_id_fkey` FOREIGN KEY (`parent_id`) REFERENCES `comments`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_project_id_fkey` FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
