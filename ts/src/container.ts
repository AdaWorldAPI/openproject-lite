// RUST: Dependency injection container — maps to a struct with Arc<dyn Trait> fields
// This wires up all repositories and services at startup.

import {
  createUserRepository,
  createSessionRepository,
  createProjectRepository,
  createTaskRepository,
  createNotificationRepository,
  createReferenceDataRepository,
  createWorkPackageExtendedRepository,
  createRoleRepository,
  createVersionRepository,
} from "./repositories";

import { createAuthService } from "./services/auth";
import { createProjectService } from "./services/project.service";
import { createTaskService } from "./services/task.service";
import { createNotificationService } from "./services/notification.service";

// Create repositories (data access layer)
const userRepo = createUserRepository();
const sessionRepo = createSessionRepository();
const projectRepo = createProjectRepository();
const taskRepo = createTaskRepository();
const notificationRepo = createNotificationRepository();
const referenceDataRepo = createReferenceDataRepository();

// Create services (business logic layer) — injected with repositories
export const authService = createAuthService(userRepo, sessionRepo);
export const projectService = createProjectService(projectRepo);
export const taskService = createTaskService(taskRepo, notificationRepo, userRepo);
export const notificationService = createNotificationService(notificationRepo);

// Reference data (read-only) — exposed directly as repository
export const referenceDataRepository = referenceDataRepo;

// User repository — exposed for /api/v3/users endpoints
export const userRepository = userRepo;

// Work package extended (relations, watchers, activities)
const workPackageExtendedRepo = createWorkPackageExtendedRepository();
export const workPackageExtendedRepository = workPackageExtendedRepo;

// Role repository — exposed for /api/v3/roles endpoints
const roleRepo = createRoleRepository();
export const roleRepository = roleRepo;

// Version repository — exposed for /api/v3/versions endpoints
const versionRepo = createVersionRepository();
export const versionRepository = versionRepo;
