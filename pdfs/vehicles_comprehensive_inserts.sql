-- ============================================================================
-- HEX TEST DRIVE PLATFORM - VEHICLE DATA SQL INSERTS
-- Generated: 2025-11-26T23:55:03.217Z
-- Source: 80 Official Manufacturer PDFs + CSV Data
-- ============================================================================

-- Vehicle table structure (reference)
-- CREATE TABLE vehicles (
--   id SERIAL PRIMARY KEY,
--   brand VARCHAR(100) NOT NULL,
--   model VARCHAR(200) NOT NULL,
--   year INTEGER NOT NULL,
--   trim VARCHAR(100),
--   price_egp INTEGER,
--   pdf_path TEXT,
--   pdf_size_mb DECIMAL(10,2),
--   pdf_sha256 VARCHAR(64),
--   source VARCHAR(50),
--   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- );


-- AUDI (4 models)

INSERT INTO vehicles (
  brand, model, year, trim, price_egp,
  pdf_path, pdf_size_mb, pdf_sha256, source
) VALUES (
  'Audi',
  'Q3',
  2024-25,
  NULL, -- Trim to be populated from pricing data
  NULL, -- Price to be populated from Hatla2ee
  'pdfs/Audi/audi_official/Q3_2024-25.pdf',
  3.29,
  '46e630e68c6df2b6f98440cfecf7c49ae54b7608f31510fbb388c1ef8994e416',
  'audi'
)
ON CONFLICT DO NOTHING; -- Idempotent insert

INSERT INTO vehicles (
  brand, model, year, trim, price_egp,
  pdf_path, pdf_size_mb, pdf_sha256, source
) VALUES (
  'Audi',
  'Q3',
  2025,
  NULL, -- Trim to be populated from pricing data
  NULL, -- Price to be populated from Hatla2ee
  'pdfs/Audi/audi_official/Q3_2025.pdf',
  3.29,
  '46e630e68c6df2b6f98440cfecf7c49ae54b7608f31510fbb388c1ef8994e416',
  'audi'
)
ON CONFLICT DO NOTHING; -- Idempotent insert

INSERT INTO vehicles (
  brand, model, year, trim, price_egp,
  pdf_path, pdf_size_mb, pdf_sha256, source
) VALUES (
  'Audi',
  'Q7',
  2024-25,
  NULL, -- Trim to be populated from pricing data
  NULL, -- Price to be populated from Hatla2ee
  'pdfs/Audi/audi_official/Q7_2024-25.pdf',
  14.38,
  'ecca26b2bff57753a31a2b708e0be065e7b76b7e2019b8fc4f196ac81bbaffea',
  'audi'
)
ON CONFLICT DO NOTHING; -- Idempotent insert

INSERT INTO vehicles (
  brand, model, year, trim, price_egp,
  pdf_path, pdf_size_mb, pdf_sha256, source
) VALUES (
  'Audi',
  'Q7',
  2025,
  NULL, -- Trim to be populated from pricing data
  NULL, -- Price to be populated from Hatla2ee
  'pdfs/Audi/audi_official/Q7_2025.pdf',
  14.38,
  'ecca26b2bff57753a31a2b708e0be065e7b76b7e2019b8fc4f196ac81bbaffea',
  'audi'
)
ON CONFLICT DO NOTHING; -- Idempotent insert


-- BMW (10 models)

INSERT INTO vehicles (
  brand, model, year, trim, price_egp,
  pdf_path, pdf_size_mb, pdf_sha256, source
) VALUES (
  'BMW',
  '5 Series-i5',
  2025,
  NULL, -- Trim to be populated from pricing data
  NULL, -- Price to be populated from Hatla2ee
  'pdfs/BMW/bmw_official/5_Series-i5_2025.pdf',
  6.35,
  '33df87baddbc5084a7c76232abea213565d93b4717f5cc5ffe314e49626d25b5',
  'bmw'
)
ON CONFLICT DO NOTHING; -- Idempotent insert

INSERT INTO vehicles (
  brand, model, year, trim, price_egp,
  pdf_path, pdf_size_mb, pdf_sha256, source
) VALUES (
  'BMW',
  '5 Series - i5',
  2025,
  NULL, -- Trim to be populated from pricing data
  NULL, -- Price to be populated from Hatla2ee
  'pdfs/BMW/bmw_official/5_Series_-_i5_2025.pdf',
  6.35,
  '33df87baddbc5084a7c76232abea213565d93b4717f5cc5ffe314e49626d25b5',
  'bmw'
)
ON CONFLICT DO NOTHING; -- Idempotent insert

INSERT INTO vehicles (
  brand, model, year, trim, price_egp,
  pdf_path, pdf_size_mb, pdf_sha256, source
) VALUES (
  'BMW',
  'X1-iX1',
  2025,
  NULL, -- Trim to be populated from pricing data
  NULL, -- Price to be populated from Hatla2ee
  'pdfs/BMW/bmw_official/X1-iX1_2025.pdf',
  7.52,
  '6bd5a41fec0d37951bbdbb7e797d51a7efe4179b3243cbd34b47eb613d7c8c77',
  'bmw'
)
ON CONFLICT DO NOTHING; -- Idempotent insert

INSERT INTO vehicles (
  brand, model, year, trim, price_egp,
  pdf_path, pdf_size_mb, pdf_sha256, source
) VALUES (
  'BMW',
  'X1 - iX1',
  2025,
  NULL, -- Trim to be populated from pricing data
  NULL, -- Price to be populated from Hatla2ee
  'pdfs/BMW/bmw_official/X1_-_iX1_2025.pdf',
  7.52,
  '6bd5a41fec0d37951bbdbb7e797d51a7efe4179b3243cbd34b47eb613d7c8c77',
  'bmw'
)
ON CONFLICT DO NOTHING; -- Idempotent insert

INSERT INTO vehicles (
  brand, model, year, trim, price_egp,
  pdf_path, pdf_size_mb, pdf_sha256, source
) VALUES (
  'BMW',
  'X2-iX2',
  2025,
  NULL, -- Trim to be populated from pricing data
  NULL, -- Price to be populated from Hatla2ee
  'pdfs/BMW/bmw_official/X2-iX2_2025.pdf',
  7.71,
  '710a9d2010cc9459562d878a940d2de6f5c60acc4fe382ebcb430e006e5cad1a',
  'bmw'
)
ON CONFLICT DO NOTHING; -- Idempotent insert

INSERT INTO vehicles (
  brand, model, year, trim, price_egp,
  pdf_path, pdf_size_mb, pdf_sha256, source
) VALUES (
  'BMW',
  'X2 - iX2',
  2024,
  NULL, -- Trim to be populated from pricing data
  NULL, -- Price to be populated from Hatla2ee
  'pdfs/BMW/bmw_official/X2_-_iX2_2024.pdf',
  7.71,
  '710a9d2010cc9459562d878a940d2de6f5c60acc4fe382ebcb430e006e5cad1a',
  'bmw'
)
ON CONFLICT DO NOTHING; -- Idempotent insert

INSERT INTO vehicles (
  brand, model, year, trim, price_egp,
  pdf_path, pdf_size_mb, pdf_sha256, source
) VALUES (
  'BMW',
  'X5 LCI',
  2024,
  NULL, -- Trim to be populated from pricing data
  NULL, -- Price to be populated from Hatla2ee
  'pdfs/BMW/bmw_official/X5_LCI_2024.pdf',
  7.24,
  'e51d5bc41eebb36dd2ea3e22b29d755cd732b9e647930bb84500ba3be86c6833',
  'bmw'
)
ON CONFLICT DO NOTHING; -- Idempotent insert

INSERT INTO vehicles (
  brand, model, year, trim, price_egp,
  pdf_path, pdf_size_mb, pdf_sha256, source
) VALUES (
  'BMW',
  'X5 LCI',
  2025,
  NULL, -- Trim to be populated from pricing data
  NULL, -- Price to be populated from Hatla2ee
  'pdfs/BMW/bmw_official/X5_LCI_2025.pdf',
  7.24,
  'e51d5bc41eebb36dd2ea3e22b29d755cd732b9e647930bb84500ba3be86c6833',
  'bmw'
)
ON CONFLICT DO NOTHING; -- Idempotent insert

INSERT INTO vehicles (
  brand, model, year, trim, price_egp,
  pdf_path, pdf_size_mb, pdf_sha256, source
) VALUES (
  'BMW',
  'X6',
  2024,
  NULL, -- Trim to be populated from pricing data
  NULL, -- Price to be populated from Hatla2ee
  'pdfs/BMW/bmw_official/X6_2024.pdf',
  2.41,
  '9bca5aeb1db6b37cb746b814667a57a72aff5e959fa7b6d91f9ec9235bc26067',
  'bmw'
)
ON CONFLICT DO NOTHING; -- Idempotent insert

INSERT INTO vehicles (
  brand, model, year, trim, price_egp,
  pdf_path, pdf_size_mb, pdf_sha256, source
) VALUES (
  'BMW',
  'X6',
  2025,
  NULL, -- Trim to be populated from pricing data
  NULL, -- Price to be populated from Hatla2ee
  'pdfs/BMW/bmw_official/X6_2025.pdf',
  2.41,
  '9bca5aeb1db6b37cb746b814667a57a72aff5e959fa7b6d91f9ec9235bc26067',
  'bmw'
)
ON CONFLICT DO NOTHING; -- Idempotent insert


-- CHERY (8 models)

INSERT INTO vehicles (
  brand, model, year, trim, price_egp,
  pdf_path, pdf_size_mb, pdf_sha256, source
) VALUES (
  'Chery',
  'Arrizo 5',
  2024,
  NULL, -- Trim to be populated from pricing data
  NULL, -- Price to be populated from Hatla2ee
  'pdfs/Chery/chery_official/Arrizo_5_2024.pdf',
  1.37,
  'b1711478c86878671ca5b28888b4eb56419cee353e01ce4db4e39c670d4062f6',
  'chery'
)
ON CONFLICT DO NOTHING; -- Idempotent insert

INSERT INTO vehicles (
  brand, model, year, trim, price_egp,
  pdf_path, pdf_size_mb, pdf_sha256, source
) VALUES (
  'Chery',
  'Arrizo 8',
  2025,
  NULL, -- Trim to be populated from pricing data
  NULL, -- Price to be populated from Hatla2ee
  'pdfs/Chery/chery_official/Arrizo_8_2025.pdf',
  3.96,
  '8d6973d84c430ec16f282f969bdd5cc2755cb2f6ba106cc84ff5bc3a0079d396',
  'chery'
)
ON CONFLICT DO NOTHING; -- Idempotent insert

INSERT INTO vehicles (
  brand, model, year, trim, price_egp,
  pdf_path, pdf_size_mb, pdf_sha256, source
) VALUES (
  'Chery',
  'Tiggo 3',
  2024,
  NULL, -- Trim to be populated from pricing data
  NULL, -- Price to be populated from Hatla2ee
  'pdfs/Chery/chery_official/Tiggo_3_2024.pdf',
  5.00,
  '39255604fd07c6aa54193e354eda0e1b5841bd5dd121cb7c86e758482c5c74f4',
  'chery'
)
ON CONFLICT DO NOTHING; -- Idempotent insert

INSERT INTO vehicles (
  brand, model, year, trim, price_egp,
  pdf_path, pdf_size_mb, pdf_sha256, source
) VALUES (
  'Chery',
  'Tiggo 4 Pro',
  2025,
  NULL, -- Trim to be populated from pricing data
  NULL, -- Price to be populated from Hatla2ee
  'pdfs/Chery/chery_official/Tiggo_4_Pro_2025.pdf',
  5.02,
  '8f2808307beb35246e7fa91dbbbc4aea4a2f9dce31450d65085e06656cc0cfe9',
  'chery'
)
ON CONFLICT DO NOTHING; -- Idempotent insert

INSERT INTO vehicles (
  brand, model, year, trim, price_egp,
  pdf_path, pdf_size_mb, pdf_sha256, source
) VALUES (
  'Chery',
  'Tiggo 7 Pro Max',
  2025,
  NULL, -- Trim to be populated from pricing data
  NULL, -- Price to be populated from Hatla2ee
  'pdfs/Chery/chery_official/Tiggo_7_Pro_Max_2025.pdf',
  2.54,
  '874d9b8d8087ef19e4b825ae38c7f5b0a83adb9a07f0d7d915dd2781f4661ea6',
  'chery'
)
ON CONFLICT DO NOTHING; -- Idempotent insert

INSERT INTO vehicles (
  brand, model, year, trim, price_egp,
  pdf_path, pdf_size_mb, pdf_sha256, source
) VALUES (
  'Chery',
  'Tiggo 8 Pro',
  2024,
  NULL, -- Trim to be populated from pricing data
  NULL, -- Price to be populated from Hatla2ee
  'pdfs/Chery/chery_official/Tiggo_8_Pro_2024.pdf',
  2.39,
  '46fea5a43f2f67b9f865766a8405cf5122170be70cec26eb9439eb5c3106acbb',
  'chery'
)
ON CONFLICT DO NOTHING; -- Idempotent insert

INSERT INTO vehicles (
  brand, model, year, trim, price_egp,
  pdf_path, pdf_size_mb, pdf_sha256, source
) VALUES (
  'Chery',
  'Tiggo 8 Pro Max',
  2025,
  NULL, -- Trim to be populated from pricing data
  NULL, -- Price to be populated from Hatla2ee
  'pdfs/Chery/chery_official/Tiggo_8_Pro_Max_2025.pdf',
  2.20,
  '6895221fd0ba52454d974e42f90c10a04da0ba58b0a51f698b8f498a39b75242',
  'chery'
)
ON CONFLICT DO NOTHING; -- Idempotent insert

INSERT INTO vehicles (
  brand, model, year, trim, price_egp,
  pdf_path, pdf_size_mb, pdf_sha256, source
) VALUES (
  'Chery',
  'eQ7 EV',
  2025,
  NULL, -- Trim to be populated from pricing data
  NULL, -- Price to be populated from Hatla2ee
  'pdfs/Chery/chery_official/eQ7_EV_2025.pdf',
  4.60,
  '76848c2aebb89878f6fd0167baa2eb918c1d57b969cc1009d2821da320ba5f1d',
  'chery'
)
ON CONFLICT DO NOTHING; -- Idempotent insert


-- CHEVROLET (3 models)

INSERT INTO vehicles (
  brand, model, year, trim, price_egp,
  pdf_path, pdf_size_mb, pdf_sha256, source
) VALUES (
  'Chevrolet',
  'Captiva',
  2025,
  NULL, -- Trim to be populated from pricing data
  NULL, -- Price to be populated from Hatla2ee
  'pdfs/Chevrolet/chevrolet_official/Captiva_2025.pdf',
  7.98,
  '3c1b1b488cabbba7c475158769c66f080976630c94b5131e3ab7db4bfcdbcdef',
  'chevrolet'
)
ON CONFLICT DO NOTHING; -- Idempotent insert

INSERT INTO vehicles (
  brand, model, year, trim, price_egp,
  pdf_path, pdf_size_mb, pdf_sha256, source
) VALUES (
  'Chevrolet',
  'Move Van',
  2024,
  NULL, -- Trim to be populated from pricing data
  NULL, -- Price to be populated from Hatla2ee
  'pdfs/Chevrolet/chevrolet_official/Move_Van_2024.pdf',
  0.74,
  'c955c936ca8b46c788b65c7dd1f965515cb222da005b3a9ce398ceb5a569fcad',
  'chevrolet'
)
ON CONFLICT DO NOTHING; -- Idempotent insert

INSERT INTO vehicles (
  brand, model, year, trim, price_egp,
  pdf_path, pdf_size_mb, pdf_sha256, source
) VALUES (
  'Chevrolet',
  'Optra',
  2026,
  NULL, -- Trim to be populated from pricing data
  NULL, -- Price to be populated from Hatla2ee
  'pdfs/Chevrolet/chevrolet_official/Optra_2026.pdf',
  2.75,
  'e5f77f5fe2cc131517fce3ba7186e6c434824853d5289a6e8aba82a94be30837',
  'chevrolet'
)
ON CONFLICT DO NOTHING; -- Idempotent insert


-- HYUNDAI (11 models)

INSERT INTO vehicles (
  brand, model, year, trim, price_egp,
  pdf_path, pdf_size_mb, pdf_sha256, source
) VALUES (
  'Hyundai',
  'Accent RB',
  2024,
  NULL, -- Trim to be populated from pricing data
  NULL, -- Price to be populated from Hatla2ee
  'pdfs/Hyundai/hyundai_official/Accent_RB_2024.pdf',
  8.69,
  '346c604b19bf22154b8169f79bca2176a2a656d8d7ce0a80e0e580986d33f0ba',
  'hyundai'
)
ON CONFLICT DO NOTHING; -- Idempotent insert

INSERT INTO vehicles (
  brand, model, year, trim, price_egp,
  pdf_path, pdf_size_mb, pdf_sha256, source
) VALUES (
  'Hyundai',
  'Accent RB GL DAB ABS Plus Prime equiv',
  2025,
  NULL, -- Trim to be populated from pricing data
  NULL, -- Price to be populated from Hatla2ee
  'pdfs/Hyundai/hyundai_official/Accent_RB_GL_DAB_ABS_Plus_Prime_equiv_2025.pdf',
  8.69,
  '346c604b19bf22154b8169f79bca2176a2a656d8d7ce0a80e0e580986d33f0ba',
  'hyundai'
)
ON CONFLICT DO NOTHING; -- Idempotent insert

INSERT INTO vehicles (
  brand, model, year, trim, price_egp,
  pdf_path, pdf_size_mb, pdf_sha256, source
) VALUES (
  'Hyundai',
  'Bayon',
  2024,
  NULL, -- Trim to be populated from pricing data
  NULL, -- Price to be populated from Hatla2ee
  'pdfs/Hyundai/hyundai_official/Bayon_2024.pdf',
  0.93,
  'afd82f00f09e7c91bbf2322fb0f01bf9ef02e78bde99a47056be7288905cd520',
  'hyundai'
)
ON CONFLICT DO NOTHING; -- Idempotent insert

INSERT INTO vehicles (
  brand, model, year, trim, price_egp,
  pdf_path, pdf_size_mb, pdf_sha256, source
) VALUES (
  'Hyundai',
  'Bayon',
  2025,
  NULL, -- Trim to be populated from pricing data
  NULL, -- Price to be populated from Hatla2ee
  'pdfs/Hyundai/hyundai_official/Bayon_2025.pdf',
  0.93,
  'afd82f00f09e7c91bbf2322fb0f01bf9ef02e78bde99a47056be7288905cd520',
  'hyundai'
)
ON CONFLICT DO NOTHING; -- Idempotent insert

INSERT INTO vehicles (
  brand, model, year, trim, price_egp,
  pdf_path, pdf_size_mb, pdf_sha256, source
) VALUES (
  'Hyundai',
  'Elantra CN7',
  2024,
  NULL, -- Trim to be populated from pricing data
  NULL, -- Price to be populated from Hatla2ee
  'pdfs/Hyundai/hyundai_official/Elantra_CN7_2024.pdf',
  8.79,
  '304c547f872a4b6090d626fd20fa0d369551ae06489dce8a766003b26e555ad7',
  'hyundai'
)
ON CONFLICT DO NOTHING; -- Idempotent insert

INSERT INTO vehicles (
  brand, model, year, trim, price_egp,
  pdf_path, pdf_size_mb, pdf_sha256, source
) VALUES (
  'Hyundai',
  'Elantra CN7 Smart-Prime',
  2025,
  NULL, -- Trim to be populated from pricing data
  NULL, -- Price to be populated from Hatla2ee
  'pdfs/Hyundai/hyundai_official/Elantra_CN7_Smart-Prime_2025.pdf',
  8.79,
  '304c547f872a4b6090d626fd20fa0d369551ae06489dce8a766003b26e555ad7',
  'hyundai'
)
ON CONFLICT DO NOTHING; -- Idempotent insert

INSERT INTO vehicles (
  brand, model, year, trim, price_egp,
  pdf_path, pdf_size_mb, pdf_sha256, source
) VALUES (
  'Hyundai',
  'I20',
  2024,
  NULL, -- Trim to be populated from pricing data
  NULL, -- Price to be populated from Hatla2ee
  'pdfs/Hyundai/hyundai_official/I20_2024.pdf',
  0.84,
  '8a438367d53d4a7e4c3778ed132d55c14304286b067c2a717876689e2c6428f9',
  'hyundai'
)
ON CONFLICT DO NOTHING; -- Idempotent insert

INSERT INTO vehicles (
  brand, model, year, trim, price_egp,
  pdf_path, pdf_size_mb, pdf_sha256, source
) VALUES (
  'Hyundai',
  'Tucson NX4',
  2024,
  NULL, -- Trim to be populated from pricing data
  NULL, -- Price to be populated from Hatla2ee
  'pdfs/Hyundai/hyundai_official/Tucson_NX4_2024.pdf',
  2.09,
  'eb80a0832040228ed3f625ff3c5c52f9924a5fbb9100293b55374336e4bff383',
  'hyundai'
)
ON CONFLICT DO NOTHING; -- Idempotent insert

INSERT INTO vehicles (
  brand, model, year, trim, price_egp,
  pdf_path, pdf_size_mb, pdf_sha256, source
) VALUES (
  'Hyundai',
  'Tucson NX4 Premium',
  2025,
  NULL, -- Trim to be populated from pricing data
  NULL, -- Price to be populated from Hatla2ee
  'pdfs/Hyundai/hyundai_official/Tucson_NX4_Premium_2025.pdf',
  2.09,
  'eb80a0832040228ed3f625ff3c5c52f9924a5fbb9100293b55374336e4bff383',
  'hyundai'
)
ON CONFLICT DO NOTHING; -- Idempotent insert

INSERT INTO vehicles (
  brand, model, year, trim, price_egp,
  pdf_path, pdf_size_mb, pdf_sha256, source
) VALUES (
  'Hyundai',
  'i10',
  2024,
  NULL, -- Trim to be populated from pricing data
  NULL, -- Price to be populated from Hatla2ee
  'pdfs/Hyundai/hyundai_official/i10_2024.pdf',
  0.92,
  '14b023032136325f6db741677cd261a72252062a29f1f3c039eb8527ef80b869',
  'hyundai'
)
ON CONFLICT DO NOTHING; -- Idempotent insert

INSERT INTO vehicles (
  brand, model, year, trim, price_egp,
  pdf_path, pdf_size_mb, pdf_sha256, source
) VALUES (
  'Hyundai',
  'i20',
  2025,
  NULL, -- Trim to be populated from pricing data
  NULL, -- Price to be populated from Hatla2ee
  'pdfs/Hyundai/hyundai_official/i20_2025.pdf',
  0.84,
  '8a438367d53d4a7e4c3778ed132d55c14304286b067c2a717876689e2c6428f9',
  'hyundai'
)
ON CONFLICT DO NOTHING; -- Idempotent insert


-- KIA (5 models)

INSERT INTO vehicles (
  brand, model, year, trim, price_egp,
  pdf_path, pdf_size_mb, pdf_sha256, source
) VALUES (
  'Kia',
  'Grand Cerato',
  2024,
  NULL, -- Trim to be populated from pricing data
  NULL, -- Price to be populated from Hatla2ee
  'pdfs/Kia/kia_official/Grand_Cerato_2024.pdf',
  2.36,
  '1fdd1693a3596cd0c40ded578f08cd3aa00a1bb2115901f20c5187b11ab4c126',
  'kia'
)
ON CONFLICT DO NOTHING; -- Idempotent insert

INSERT INTO vehicles (
  brand, model, year, trim, price_egp,
  pdf_path, pdf_size_mb, pdf_sha256, source
) VALUES (
  'Kia',
  'Seltos',
  2025,
  NULL, -- Trim to be populated from pricing data
  NULL, -- Price to be populated from Hatla2ee
  'pdfs/Kia/kia_official/Seltos_2025.pdf',
  3.06,
  'ad0e408db64aa3454ba96f9648659e9d7113564a66bae2eec08789984617862f',
  'kia'
)
ON CONFLICT DO NOTHING; -- Idempotent insert

INSERT INTO vehicles (
  brand, model, year, trim, price_egp,
  pdf_path, pdf_size_mb, pdf_sha256, source
) VALUES (
  'Kia',
  'Sorento',
  2024,
  NULL, -- Trim to be populated from pricing data
  NULL, -- Price to be populated from Hatla2ee
  'pdfs/Kia/kia_official/Sorento_2024.pdf',
  1.10,
  'dd1f9e757bee452d08a6b018ef4a9345e09ef1990076e2e5153653e2f854c07b',
  'kia'
)
ON CONFLICT DO NOTHING; -- Idempotent insert

INSERT INTO vehicles (
  brand, model, year, trim, price_egp,
  pdf_path, pdf_size_mb, pdf_sha256, source
) VALUES (
  'Kia',
  'Sportage',
  2025,
  NULL, -- Trim to be populated from pricing data
  NULL, -- Price to be populated from Hatla2ee
  'pdfs/Kia/kia_official/Sportage_2025.pdf',
  2.58,
  'fad36207a8dba33c65653fef624e543a173414bc7c13b48deaf2bff45caa8736',
  'kia'
)
ON CONFLICT DO NOTHING; -- Idempotent insert

INSERT INTO vehicles (
  brand, model, year, trim, price_egp,
  pdf_path, pdf_size_mb, pdf_sha256, source
) VALUES (
  'Kia',
  'XCeed',
  2024,
  NULL, -- Trim to be populated from pricing data
  NULL, -- Price to be populated from Hatla2ee
  'pdfs/Kia/kia_official/XCeed_2024.pdf',
  7.36,
  '71844c702d46615679fb06d8f1362bd1a1b68603fefbf7e3be19eb8dbb000eff',
  'kia'
)
ON CONFLICT DO NOTHING; -- Idempotent insert


-- MG (10 models)

INSERT INTO vehicles (
  brand, model, year, trim, price_egp,
  pdf_path, pdf_size_mb, pdf_sha256, source
) VALUES (
  'MG',
  'HS',
  2024,
  NULL, -- Trim to be populated from pricing data
  NULL, -- Price to be populated from Hatla2ee
  'pdfs/MG/mg_official/HS_2024.pdf',
  2.16,
  '147250d98ba51ba546dc3f95ce72775699e927b2787bcaa65aa380aa2a0d636a',
  'mg'
)
ON CONFLICT DO NOTHING; -- Idempotent insert

INSERT INTO vehicles (
  brand, model, year, trim, price_egp,
  pdf_path, pdf_size_mb, pdf_sha256, source
) VALUES (
  'MG',
  'MG 4 EV',
  2024,
  NULL, -- Trim to be populated from pricing data
  NULL, -- Price to be populated from Hatla2ee
  'pdfs/MG/mg_official/MG_4_EV_2024.pdf',
  1.38,
  '2bead64ec5944493b0607793ac036a54e2bf67bf133e0431d2faead2da52de40',
  'mg'
)
ON CONFLICT DO NOTHING; -- Idempotent insert

INSERT INTO vehicles (
  brand, model, year, trim, price_egp,
  pdf_path, pdf_size_mb, pdf_sha256, source
) VALUES (
  'MG',
  'MG 4 EV',
  2025,
  NULL, -- Trim to be populated from pricing data
  NULL, -- Price to be populated from Hatla2ee
  'pdfs/MG/mg_official/MG_4_EV_2025.pdf',
  1.38,
  '2bead64ec5944493b0607793ac036a54e2bf67bf133e0431d2faead2da52de40',
  'mg'
)
ON CONFLICT DO NOTHING; -- Idempotent insert

INSERT INTO vehicles (
  brand, model, year, trim, price_egp,
  pdf_path, pdf_size_mb, pdf_sha256, source
) VALUES (
  'MG',
  'MG 5',
  2025,
  NULL, -- Trim to be populated from pricing data
  NULL, -- Price to be populated from Hatla2ee
  'pdfs/MG/mg_official/MG_5_2025.pdf',
  2.96,
  '37a8a191373e4b79d48f92a9e4e7b2d1b7c331199b354e8810af2933c7428ea4',
  'mg'
)
ON CONFLICT DO NOTHING; -- Idempotent insert

INSERT INTO vehicles (
  brand, model, year, trim, price_egp,
  pdf_path, pdf_size_mb, pdf_sha256, source
) VALUES (
  'MG',
  'MG 5 Amended',
  2025,
  NULL, -- Trim to be populated from pricing data
  NULL, -- Price to be populated from Hatla2ee
  'pdfs/MG/mg_official/MG_5_Amended_2025.pdf',
  2.96,
  '37a8a191373e4b79d48f92a9e4e7b2d1b7c331199b354e8810af2933c7428ea4',
  'mg'
)
ON CONFLICT DO NOTHING; -- Idempotent insert

INSERT INTO vehicles (
  brand, model, year, trim, price_egp,
  pdf_path, pdf_size_mb, pdf_sha256, source
) VALUES (
  'MG',
  'MG 6',
  2024,
  NULL, -- Trim to be populated from pricing data
  NULL, -- Price to be populated from Hatla2ee
  'pdfs/MG/mg_official/MG_6_2024.pdf',
  1.32,
  'd8b614ab5091994850b61522539f5146a0ee0d9801d00a835fd757c7a261617a',
  'mg'
)
ON CONFLICT DO NOTHING; -- Idempotent insert

INSERT INTO vehicles (
  brand, model, year, trim, price_egp,
  pdf_path, pdf_size_mb, pdf_sha256, source
) VALUES (
  'MG',
  'MG HS',
  2025,
  NULL, -- Trim to be populated from pricing data
  NULL, -- Price to be populated from Hatla2ee
  'pdfs/MG/mg_official/MG_HS_2025.pdf',
  2.16,
  '147250d98ba51ba546dc3f95ce72775699e927b2787bcaa65aa380aa2a0d636a',
  'mg'
)
ON CONFLICT DO NOTHING; -- Idempotent insert

INSERT INTO vehicles (
  brand, model, year, trim, price_egp,
  pdf_path, pdf_size_mb, pdf_sha256, source
) VALUES (
  'MG',
  'MG ZS Lux',
  2025,
  NULL, -- Trim to be populated from pricing data
  NULL, -- Price to be populated from Hatla2ee
  'pdfs/MG/mg_official/MG_ZS_Lux_2025.pdf',
  1.58,
  'ab848d2928fde71b7811807fb53386b2d58e2df84af66f64ed16830c0535513e',
  'mg'
)
ON CONFLICT DO NOTHING; -- Idempotent insert

INSERT INTO vehicles (
  brand, model, year, trim, price_egp,
  pdf_path, pdf_size_mb, pdf_sha256, source
) VALUES (
  'MG',
  'RX5',
  2025,
  NULL, -- Trim to be populated from pricing data
  NULL, -- Price to be populated from Hatla2ee
  'pdfs/MG/mg_official/RX5_2025.pdf',
  13.85,
  '2e6c21c9fe05f61d6c92ceaddec897634261052988ac6f154431fb167940412e',
  'mg'
)
ON CONFLICT DO NOTHING; -- Idempotent insert

INSERT INTO vehicles (
  brand, model, year, trim, price_egp,
  pdf_path, pdf_size_mb, pdf_sha256, source
) VALUES (
  'MG',
  'ZS',
  2024,
  NULL, -- Trim to be populated from pricing data
  NULL, -- Price to be populated from Hatla2ee
  'pdfs/MG/mg_official/ZS_2024.pdf',
  1.58,
  'ab848d2928fde71b7811807fb53386b2d58e2df84af66f64ed16830c0535513e',
  'mg'
)
ON CONFLICT DO NOTHING; -- Idempotent insert


-- MERCEDES (1 models)

INSERT INTO vehicles (
  brand, model, year, trim, price_egp,
  pdf_path, pdf_size_mb, pdf_sha256, source
) VALUES (
  'Mercedes',
  'C-Class W206',
  2025,
  NULL, -- Trim to be populated from pricing data
  NULL, -- Price to be populated from Hatla2ee
  'pdfs/Mercedes/mercedes_official/C-Class_W206_2025.pdf',
  55.80,
  '64bdfb811da170a53f28ac3fe264abf0560f022ffb524148b79e44922bc4ff25',
  'mercedes'
)
ON CONFLICT DO NOTHING; -- Idempotent insert


-- MITSUBISHI (5 models)

INSERT INTO vehicles (
  brand, model, year, trim, price_egp,
  pdf_path, pdf_size_mb, pdf_sha256, source
) VALUES (
  'Mitsubishi',
  'Accessories',
  2025,
  NULL, -- Trim to be populated from pricing data
  NULL, -- Price to be populated from Hatla2ee
  'pdfs/Mitsubishi/mitsubishi_official/Accessories_2025.pdf',
  9.20,
  'bb79ba921624da22a4522cf95e612c0b0c4afc92932e4a5307b1421a63c9db9e',
  'mitsubishi'
)
ON CONFLICT DO NOTHING; -- Idempotent insert

INSERT INTO vehicles (
  brand, model, year, trim, price_egp,
  pdf_path, pdf_size_mb, pdf_sha256, source
) VALUES (
  'Mitsubishi',
  'Attrage',
  2024,
  NULL, -- Trim to be populated from pricing data
  NULL, -- Price to be populated from Hatla2ee
  'pdfs/Mitsubishi/mitsubishi_official/Attrage_2024.pdf',
  4.22,
  '4e45f940cded951303f375f1d0498dd911771ae98ba16f85bf1215dc169bb501',
  'mitsubishi'
)
ON CONFLICT DO NOTHING; -- Idempotent insert

INSERT INTO vehicles (
  brand, model, year, trim, price_egp,
  pdf_path, pdf_size_mb, pdf_sha256, source
) VALUES (
  'Mitsubishi',
  'Attrage',
  2025,
  NULL, -- Trim to be populated from pricing data
  NULL, -- Price to be populated from Hatla2ee
  'pdfs/Mitsubishi/mitsubishi_official/Attrage_2025.pdf',
  4.22,
  '4e45f940cded951303f375f1d0498dd911771ae98ba16f85bf1215dc169bb501',
  'mitsubishi'
)
ON CONFLICT DO NOTHING; -- Idempotent insert

INSERT INTO vehicles (
  brand, model, year, trim, price_egp,
  pdf_path, pdf_size_mb, pdf_sha256, source
) VALUES (
  'Mitsubishi',
  'Mirage',
  2024,
  NULL, -- Trim to be populated from pricing data
  NULL, -- Price to be populated from Hatla2ee
  'pdfs/Mitsubishi/mitsubishi_official/Mirage_2024.pdf',
  5.02,
  '1c434c6e015e7f0254a7d22054bdce5f93d4b0581ee3eca8e4d4c98d84ab0ee6',
  'mitsubishi'
)
ON CONFLICT DO NOTHING; -- Idempotent insert

INSERT INTO vehicles (
  brand, model, year, trim, price_egp,
  pdf_path, pdf_size_mb, pdf_sha256, source
) VALUES (
  'Mitsubishi',
  'Mirage',
  2025,
  NULL, -- Trim to be populated from pricing data
  NULL, -- Price to be populated from Hatla2ee
  'pdfs/Mitsubishi/mitsubishi_official/Mirage_2025.pdf',
  5.02,
  '1c434c6e015e7f0254a7d22054bdce5f93d4b0581ee3eca8e4d4c98d84ab0ee6',
  'mitsubishi'
)
ON CONFLICT DO NOTHING; -- Idempotent insert


-- NISSAN (8 models)

INSERT INTO vehicles (
  brand, model, year, trim, price_egp,
  pdf_path, pdf_size_mb, pdf_sha256, source
) VALUES (
  'Nissan',
  'Juke',
  2025,
  NULL, -- Trim to be populated from pricing data
  NULL, -- Price to be populated from Hatla2ee
  'pdfs/Nissan/nissan_official/Juke_2025.pdf',
  8.42,
  '7237ea584cf9f944d2f3846ab54795ba53d271b7cbbef653213c224881cb7e2d',
  'nissan'
)
ON CONFLICT DO NOTHING; -- Idempotent insert

INSERT INTO vehicles (
  brand, model, year, trim, price_egp,
  pdf_path, pdf_size_mb, pdf_sha256, source
) VALUES (
  'Nissan',
  'Patrol',
  2025,
  NULL, -- Trim to be populated from pricing data
  NULL, -- Price to be populated from Hatla2ee
  'pdfs/Nissan/nissan_official/Patrol_2025.pdf',
  10.15,
  'e25cdf806e07b52e0c22a52433053799c5a36e9e9ae83a9efca12f42677f41e8',
  'nissan'
)
ON CONFLICT DO NOTHING; -- Idempotent insert

INSERT INTO vehicles (
  brand, model, year, trim, price_egp,
  pdf_path, pdf_size_mb, pdf_sha256, source
) VALUES (
  'Nissan',
  'Qashqai',
  2025,
  NULL, -- Trim to be populated from pricing data
  NULL, -- Price to be populated from Hatla2ee
  'pdfs/Nissan/nissan_official/Qashqai_2025.pdf',
  6.66,
  '7999120282bd7f0f669bc7828f799404073cac71960b80cd896fddad12d051c8',
  'nissan'
)
ON CONFLICT DO NOTHING; -- Idempotent insert

INSERT INTO vehicles (
  brand, model, year, trim, price_egp,
  pdf_path, pdf_size_mb, pdf_sha256, source
) VALUES (
  'Nissan',
  'Sentra',
  2024-25,
  NULL, -- Trim to be populated from pricing data
  NULL, -- Price to be populated from Hatla2ee
  'pdfs/Nissan/nissan_official/Sentra_2024-25.pdf',
  0.70,
  '5f98dfa149d998f0f3a332a9a253612b2f32a43d04b12f6d3c0a4060c9e7300a',
  'nissan'
)
ON CONFLICT DO NOTHING; -- Idempotent insert

INSERT INTO vehicles (
  brand, model, year, trim, price_egp,
  pdf_path, pdf_size_mb, pdf_sha256, source
) VALUES (
  'Nissan',
  'Sentra',
  2025,
  NULL, -- Trim to be populated from pricing data
  NULL, -- Price to be populated from Hatla2ee
  'pdfs/Nissan/nissan_official/Sentra_2025.pdf',
  0.70,
  '5f98dfa149d998f0f3a332a9a253612b2f32a43d04b12f6d3c0a4060c9e7300a',
  'nissan'
)
ON CONFLICT DO NOTHING; -- Idempotent insert

INSERT INTO vehicles (
  brand, model, year, trim, price_egp,
  pdf_path, pdf_size_mb, pdf_sha256, source
) VALUES (
  'Nissan',
  'Sunny',
  2025,
  NULL, -- Trim to be populated from pricing data
  NULL, -- Price to be populated from Hatla2ee
  'pdfs/Nissan/nissan_official/Sunny_2025.pdf',
  2.08,
  '4108f9a2cef5b7a343d27507a6feb3be60c39be016d2d9dca9f017eef9ffa08a',
  'nissan'
)
ON CONFLICT DO NOTHING; -- Idempotent insert

INSERT INTO vehicles (
  brand, model, year, trim, price_egp,
  pdf_path, pdf_size_mb, pdf_sha256, source
) VALUES (
  'Nissan',
  'Urvan',
  2025,
  NULL, -- Trim to be populated from pricing data
  NULL, -- Price to be populated from Hatla2ee
  'pdfs/Nissan/nissan_official/Urvan_2025.pdf',
  1.24,
  'f8b83dcd0676456ae6c69c5b6c53adacfff0a58ef58d81aa5958d0411b0b28f4',
  'nissan'
)
ON CONFLICT DO NOTHING; -- Idempotent insert

INSERT INTO vehicles (
  brand, model, year, trim, price_egp,
  pdf_path, pdf_size_mb, pdf_sha256, source
) VALUES (
  'Nissan',
  'X-Trail e-POWER',
  2025,
  NULL, -- Trim to be populated from pricing data
  NULL, -- Price to be populated from Hatla2ee
  'pdfs/Nissan/nissan_official/X-Trail_e-POWER_2025.pdf',
  5.42,
  '1a23236fdad6831d6a6c2c933c693f4af6bcbc0a8982cdfab7aa24e8965c1832',
  'nissan'
)
ON CONFLICT DO NOTHING; -- Idempotent insert


-- RENAULT (3 models)

INSERT INTO vehicles (
  brand, model, year, trim, price_egp,
  pdf_path, pdf_size_mb, pdf_sha256, source
) VALUES (
  'Renault',
  'Duster',
  2024,
  NULL, -- Trim to be populated from pricing data
  NULL, -- Price to be populated from Hatla2ee
  'pdfs/Renault/renault_official/Duster_2024.pdf',
  0.52,
  'e03c1f71fd1ce980cddd2cd77de113cceea81b5932f584291fbcebd617f36572',
  'renault'
)
ON CONFLICT DO NOTHING; -- Idempotent insert

INSERT INTO vehicles (
  brand, model, year, trim, price_egp,
  pdf_path, pdf_size_mb, pdf_sha256, source
) VALUES (
  'Renault',
  'Megane',
  2024,
  NULL, -- Trim to be populated from pricing data
  NULL, -- Price to be populated from Hatla2ee
  'pdfs/Renault/renault_official/Megane_2024.pdf',
  1.41,
  '6590f9353ff7a1fa091fce918765b462999dd8e5ad1d90134677d91d9d9b587a',
  'renault'
)
ON CONFLICT DO NOTHING; -- Idempotent insert

INSERT INTO vehicles (
  brand, model, year, trim, price_egp,
  pdf_path, pdf_size_mb, pdf_sha256, source
) VALUES (
  'Renault',
  'Megane Grand Coupé',
  2025,
  NULL, -- Trim to be populated from pricing data
  NULL, -- Price to be populated from Hatla2ee
  'pdfs/Renault/renault_official/Megane_Grand_Coupé_2025.pdf',
  1.41,
  '6590f9353ff7a1fa091fce918765b462999dd8e5ad1d90134677d91d9d9b587a',
  'renault'
)
ON CONFLICT DO NOTHING; -- Idempotent insert


-- TOYOTA (12 models)

INSERT INTO vehicles (
  brand, model, year, trim, price_egp,
  pdf_path, pdf_size_mb, pdf_sha256, source
) VALUES (
  'Toyota',
  'Belta',
  2024,
  NULL, -- Trim to be populated from pricing data
  NULL, -- Price to be populated from Hatla2ee
  'pdfs/Toyota/toyota_official/Belta_2024.pdf',
  4.55,
  'a57922c90284431c000b3934f3f465d5626be3f0ec6f56e9219a6c68777997c6',
  'toyota'
)
ON CONFLICT DO NOTHING; -- Idempotent insert

INSERT INTO vehicles (
  brand, model, year, trim, price_egp,
  pdf_path, pdf_size_mb, pdf_sha256, source
) VALUES (
  'Toyota',
  'Camry',
  2024,
  NULL, -- Trim to be populated from pricing data
  NULL, -- Price to be populated from Hatla2ee
  'pdfs/Toyota/toyota_official/Camry_2024.pdf',
  1.53,
  'f094b0457260ea235a57402e99e6413a545ed2a2b53afb5fc6fd60d535deb990',
  'toyota'
)
ON CONFLICT DO NOTHING; -- Idempotent insert

INSERT INTO vehicles (
  brand, model, year, trim, price_egp,
  pdf_path, pdf_size_mb, pdf_sha256, source
) VALUES (
  'Toyota',
  'Camry',
  2025,
  NULL, -- Trim to be populated from pricing data
  NULL, -- Price to be populated from Hatla2ee
  'pdfs/Toyota/toyota_official/Camry_2025.pdf',
  1.53,
  'f094b0457260ea235a57402e99e6413a545ed2a2b53afb5fc6fd60d535deb990',
  'toyota'
)
ON CONFLICT DO NOTHING; -- Idempotent insert

INSERT INTO vehicles (
  brand, model, year, trim, price_egp,
  pdf_path, pdf_size_mb, pdf_sha256, source
) VALUES (
  'Toyota',
  'Coaster',
  2024,
  NULL, -- Trim to be populated from pricing data
  NULL, -- Price to be populated from Hatla2ee
  'pdfs/Toyota/toyota_official/Coaster_2024.pdf',
  2.48,
  '166324ae28151d6da8b93a5e8c257ea354c009a02b3125360fbdbe1e2436e016',
  'toyota'
)
ON CONFLICT DO NOTHING; -- Idempotent insert

INSERT INTO vehicles (
  brand, model, year, trim, price_egp,
  pdf_path, pdf_size_mb, pdf_sha256, source
) VALUES (
  'Toyota',
  'Corolla',
  2026,
  NULL, -- Trim to be populated from pricing data
  NULL, -- Price to be populated from Hatla2ee
  'pdfs/Toyota/toyota_official/Corolla_2026.pdf',
  8.70,
  'fa68f2f2e01a871d6c40d14630a93253f9bf122bb00bc7fde2d545553af305e9',
  'toyota'
)
ON CONFLICT DO NOTHING; -- Idempotent insert

INSERT INTO vehicles (
  brand, model, year, trim, price_egp,
  pdf_path, pdf_size_mb, pdf_sha256, source
) VALUES (
  'Toyota',
  'Corolla all trims',
  2026,
  NULL, -- Trim to be populated from pricing data
  NULL, -- Price to be populated from Hatla2ee
  'pdfs/Toyota/toyota_official/Corolla_all_trims_2026.pdf',
  8.70,
  'fa68f2f2e01a871d6c40d14630a93253f9bf122bb00bc7fde2d545553af305e9',
  'toyota'
)
ON CONFLICT DO NOTHING; -- Idempotent insert

INSERT INTO vehicles (
  brand, model, year, trim, price_egp,
  pdf_path, pdf_size_mb, pdf_sha256, source
) VALUES (
  'Toyota',
  'Hiace Ace',
  2025,
  NULL, -- Trim to be populated from pricing data
  NULL, -- Price to be populated from Hatla2ee
  'pdfs/Toyota/toyota_official/Hiace_Ace_2025.pdf',
  3.20,
  'ea992a823230cf7fafab2705c47f0936566f3a802260c16211decad120cbcca8',
  'toyota'
)
ON CONFLICT DO NOTHING; -- Idempotent insert

INSERT INTO vehicles (
  brand, model, year, trim, price_egp,
  pdf_path, pdf_size_mb, pdf_sha256, source
) VALUES (
  'Toyota',
  'Hilux',
  2025,
  NULL, -- Trim to be populated from pricing data
  NULL, -- Price to be populated from Hatla2ee
  'pdfs/Toyota/toyota_official/Hilux_2025.pdf',
  1.76,
  '0e0913fc55e968dd9701a8f98c1522f75a06163315d8c3bf72d854660650c262',
  'toyota'
)
ON CONFLICT DO NOTHING; -- Idempotent insert

INSERT INTO vehicles (
  brand, model, year, trim, price_egp,
  pdf_path, pdf_size_mb, pdf_sha256, source
) VALUES (
  'Toyota',
  'Hilux GLX',
  2025,
  NULL, -- Trim to be populated from pricing data
  NULL, -- Price to be populated from Hatla2ee
  'pdfs/Toyota/toyota_official/Hilux_GLX_2025.pdf',
  1.76,
  '0e0913fc55e968dd9701a8f98c1522f75a06163315d8c3bf72d854660650c262',
  'toyota'
)
ON CONFLICT DO NOTHING; -- Idempotent insert

INSERT INTO vehicles (
  brand, model, year, trim, price_egp,
  pdf_path, pdf_size_mb, pdf_sha256, source
) VALUES (
  'Toyota',
  'Land Cruiser 250',
  2025,
  NULL, -- Trim to be populated from pricing data
  NULL, -- Price to be populated from Hatla2ee
  'pdfs/Toyota/toyota_official/Land_Cruiser_250_2025.pdf',
  1.90,
  'f5880028a7ca7e709bab101da55629cf5ac16d4546f95393a9ae850764b66a04',
  'toyota'
)
ON CONFLICT DO NOTHING; -- Idempotent insert

INSERT INTO vehicles (
  brand, model, year, trim, price_egp,
  pdf_path, pdf_size_mb, pdf_sha256, source
) VALUES (
  'Toyota',
  'RAV4',
  2024,
  NULL, -- Trim to be populated from pricing data
  NULL, -- Price to be populated from Hatla2ee
  'pdfs/Toyota/toyota_official/RAV4_2024.pdf',
  2.95,
  '6d08b98d56b6aad3cf62f07a93831180487c2b1483665d6114dfa4a439ed2ded',
  'toyota'
)
ON CONFLICT DO NOTHING; -- Idempotent insert

INSERT INTO vehicles (
  brand, model, year, trim, price_egp,
  pdf_path, pdf_size_mb, pdf_sha256, source
) VALUES (
  'Toyota',
  'RAV4',
  2025,
  NULL, -- Trim to be populated from pricing data
  NULL, -- Price to be populated from Hatla2ee
  'pdfs/Toyota/toyota_official/RAV4_2025.pdf',
  2.95,
  '6d08b98d56b6aad3cf62f07a93831180487c2b1483665d6114dfa4a439ed2ded',
  'toyota'
)
ON CONFLICT DO NOTHING; -- Idempotent insert


-- ============================================================================
-- SUMMARY
-- Total vehicles: 80
-- Brands covered: 59
-- Data completeness:
--   - PDF files: 100%
--   - Basic metadata: 100%
--   - Technical specs: 0% (pending extraction)
--   - Pricing: 0% (pending Hatla2ee scrape)
-- ============================================================================

-- ============================================================================
-- VEHICLE SPECIFICATIONS TABLE (for future use)
-- ============================================================================

CREATE TABLE IF NOT EXISTS vehicle_specifications (
  id SERIAL PRIMARY KEY,
  vehicle_id INTEGER REFERENCES vehicles(id) ON DELETE CASCADE,
  
  -- Dimensions
  length_mm INTEGER,
  width_mm INTEGER,
  height_mm INTEGER,
  wheelbase_mm INTEGER,
  ground_clearance_mm INTEGER, -- CRITICAL for Egyptian market
  
  -- Capacity
  seats INTEGER,
  ac_zones INTEGER, -- 1/2/3 zone climate control
  trunk_capacity_liters INTEGER,
  fuel_tank_capacity_liters INTEGER,
  
  -- Engine
  engine_displacement_liters DECIMAL(3,1),
  horsepower INTEGER,
  torque_nm INTEGER,
  fuel_type VARCHAR(50), -- petrol/diesel/hybrid/electric
  
  -- Transmission
  transmission_type VARCHAR(50), -- automatic/manual/cvt/dct
  transmission_speeds INTEGER,
  clutch_type VARCHAR(20), -- wet/dry DCT - CRITICAL for Egyptian market
  drivetrain VARCHAR(20), -- FWD/RWD/AWD/4WD
  
  -- Performance
  zero_to_100_seconds DECIMAL(4,2),
  top_speed_kmh INTEGER,
  fuel_economy_city DECIMAL(4,1),
  fuel_economy_highway DECIMAL(4,1),
  
  -- Warranty
  warranty_years INTEGER,
  warranty_km INTEGER,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_specs_vehicle_id ON vehicle_specifications(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_specs_clutch_type ON vehicle_specifications(clutch_type); -- For Egyptian market queries
