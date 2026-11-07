# AWS Deployment Architecture & Runbook

**Project:** Cloud-Based Logistics and Delivery Management System with DevOps Automation  
**Group:** 78  
**Target Cloud:** Amazon Web Services (AWS)  

---

## 1. Cloud Architecture Overview

For an academic DevOps Engineering project, the simplest, most secure, and cost-effective containerized production architecture on AWS uses **Amazon ECS (Elastic Container Service) with AWS Fargate** (serverless containers) and **Amazon DocumentDB** (or a managed MongoDB Atlas on AWS / EC2 MongoDB instance).

```
                            ┌────────────────────────┐
                            │    Route 53 (DNS)      │
                            └───────────┬────────────┘
                                        │
                                        ▼
                            ┌────────────────────────┐
                            │ Application Load       │
                            │ Balancer (ALB) - HTTPS │
                            └─────┬────────────┬─────┘
                                  │            │
                 ┌────────────────┘            └────────────────┐
                 │ Path: /*                                     │ Path: /api/*
                 ▼                                              ▼
    ┌─────────────────────────┐                    ┌─────────────────────────┐
    │  ECS Fargate: Frontend  │                    │  ECS Fargate: Backend   │
    │  Nginx + React SPA      │                    │  Node.js + Express      │
    │  (Port 8080)            │                    │  (Port 5000)            │
    └─────────────────────────┘                    └────────────┬────────────┘
                                                                │
                                                                ▼
                                                   ┌─────────────────────────┐
                                                   │  DocumentDB / MongoDB   │
                                                   │  Private Subnet (27017) │
                                                   └─────────────────────────┘
                                                                │
                                                   ┌────────────┴────────────┐
                                                   │ AWS Secrets Manager     │
                                                   │ (JWT_SECRET, DB_URI)    │
                                                   └─────────────────────────┘
```

---

## 2. Required AWS Services

1. **Amazon ECR (Elastic Container Registry):** Private container registries storing backend (`routeflow/backend:latest`) and frontend (`routeflow/frontend:latest`) Docker images.
2. **Amazon ECS (Elastic Container Service) with AWS Fargate:** Runs container tasks without managing virtual machine infrastructure.
3. **Application Load Balancer (ALB):** Terminates TLS/HTTPS, performs health checks against `/api/health/ready`, and routes traffic (`/api/*` to backend target group, `/*` to frontend target group).
4. **Amazon DocumentDB (or MongoDB Atlas on AWS VPC Peering):** Fully managed, MongoDB-compatible document database deployed in isolated private subnets.
5. **AWS Secrets Manager & Parameter Store:** Safely stores sensitive values (`MONGODB_URI`, `JWT_SECRET`) injected as container environment variables at runtime.
6. **Amazon CloudWatch:** Collects container stdout/stderr logs from Winston via `awslogs` log driver, monitors ECS CPU/memory utilization, and configures alarms.
7. **AWS IAM (Identity and Access Management):** ECS Task Execution Roles granting least-privilege permissions to read Secrets Manager and write logs to CloudWatch.

---

## 3. Security & Networking Configuration

- **VPC Design:**
  - 2 Public Subnets (across 2 Availability Zones for ALB high availability).
  - 2 Private Subnets (for ECS tasks and Database).
- **Security Groups:**
  - `ALB-SG`: Ingress ports 80/443 from `0.0.0.0/0`.
  - `ECS-Backend-SG`: Ingress port 5000 strictly from `ALB-SG` and `ECS-Frontend-SG`.
  - `MongoDB-SG`: Ingress port 27017 strictly from `ECS-Backend-SG`.
- **Zero Secrets in Git/Images:** No credentials, tokens, or environment files are baked into Docker images.

---

## 4. Step-by-Step Deployment Guide

### Step 1: Build and Push Docker Images to Amazon ECR
```bash
# 1. Authenticate Docker CLI to AWS ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <aws_account_id>.dkr.ecr.us-east-1.amazonaws.com

# 2. Build and Tag Backend Image
docker build -t routeflow/backend:latest ./Back-End
docker tag routeflow/backend:latest <aws_account_id>.dkr.ecr.us-east-1.amazonaws.com/routeflow-backend:latest
docker push <aws_account_id>.dkr.ecr.us-east-1.amazonaws.com/routeflow-backend:latest

# 3. Build and Tag Frontend Image
docker build -t routeflow/frontend:latest ./Front-End
docker tag routeflow/frontend:latest <aws_account_id>.dkr.ecr.us-east-1.amazonaws.com/routeflow-frontend:latest
docker push <aws_account_id>.dkr.ecr.us-east-1.amazonaws.com/routeflow-frontend:latest
```

### Step 2: Configure Secrets in AWS Secrets Manager
```bash
aws secretsmanager create-secret \
  --name "routeflow/production" \
  --description "Routeflow Logistics Production Secrets" \
  --secret-string '{"JWT_SECRET":"<secure_random_64_char_key>","MONGODB_URI":"mongodb://<dbuser>:<dbpassword>@<docdb_cluster_endpoint>:27017/routeflow?ssl=true&replicaSet=rs0&readPreference=secondaryPreferred&retryWrites=false"}'
```

### Step 3: Register ECS Task Definitions & Service
Create an ECS Task Definition specifying:
- CPU: 512 (0.5 vCPU)
- Memory: 1024 MB (1 GB)
- Port Mappings: 5000
- Environment Variables:
  - `NODE_ENV`: `production`
  - `PORT`: `5000`
  - `FRONTEND_ORIGIN`: `https://your-routeflow-domain.com`
- Secrets (from Secrets Manager):
  - `JWT_SECRET`: `arn:aws:secretsmanager:us-east-1:<id>:secret:routeflow/production:JWT_SECRET::`
  - `MONGODB_URI`: `arn:aws:secretsmanager:us-east-1:<id>:secret:routeflow/production:MONGODB_URI::`
- Healthcheck:
  - Command: `["CMD-SHELL", "node -e \"require('http').get('http://localhost:5000/api/health/ready', (r) => process.exit(r.statusCode === 200 ? 0 : 1))\""]`

### Step 4: Configure ALB Target Group
- Target Type: `IP` (Fargate compatibility)
- Protocol: `HTTP` on port `5000`
- Health check path: `/api/health/ready`
- Healthy threshold: 2, Interval: 30s, Timeout: 5s

### Step 5: Execute Initial Seed Task
Run a one-off standalone Fargate task using the backend image to execute:
```bash
node scripts/seedAdmin.js
```
This populates the bootstrap administrator and initial fleet roster.

---

## 5. Rollback & Disaster Recovery Strategy

1. **ECS Rolling Deployments with Circuit Breaker:**
   Amazon ECS deployment circuit breaker automatically rolls back to the previous healthy task definition if new tasks fail the readiness health checks within the evaluation period.
2. **Instant Manual Rollback:**
   ```bash
   aws ecs update-service \
     --cluster routeflow-production-cluster \
     --service routeflow-backend-service \
     --task-definition routeflow-backend:<previous_revision_number>
   ```
3. **Database Automated Backups:**
   Amazon DocumentDB performs continuous incremental backups with Point-In-Time Restore (PITR) up to 35 days and multi-AZ failover.

