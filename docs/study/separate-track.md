# Separate track (not in the app)

Technologies job postings ask for that LinguaStream does not use (D-048, D-061). About 5 hours a week, alongside the app track. Order follows value for applications.

## 1. AWS (#11) · ~20 h

**Learn:** IAM (users, roles, policies), S3, EC2 and ECS or Lambda, RDS, VPC basics, CloudWatch.
**Exercise:** deploy a small API from this repository's stack to AWS by hand (ECS or Lambda + RDS), then tear it down. Watch the bill.
**Resources**
- [AWS Skill Builder](https://skillbuilder.aws/) (Cloud Practitioner Essentials is free)
- [AWS documentation](https://docs.aws.amazon.com/)

## 2. Distributed systems / system design (#15) · ~20 h, ongoing

**Learn:** CAP, consistency models, caching strategies, scaling reads and writes, queues, idempotency, load balancing.
**Exercise:** write up LinguaStream's design as a system design answer, then redesign it for 100,000 users.
**Resources**
- [System Design Primer](https://github.com/donnemartin/system-design-primer)
- *Designing Data-Intensive Applications* (Martin Kleppmann, book)

## 3. GraphQL (#14) · ~8 h

**Learn:** schema, queries and mutations, resolvers, the N+1 problem and DataLoader.
**Exercise:** a small GraphQL API over a copy of the vocabulary schema, with DataLoader fixing an N+1.
**Resources**
- [Learn GraphQL](https://graphql.org/learn/)
- [DataLoader](https://github.com/graphql/dataloader)

## 4. MongoDB and NoSQL (#13) · ~8 h

**Learn:** document modelling, embedding vs referencing, indexes, when NoSQL beats SQL.
**Exercise:** model the vocabulary and connections as documents and compare with the Postgres design.
**Resources**
- [MongoDB University](https://learn.mongodb.com/)
- [MongoDB data modelling](https://www.mongodb.com/docs/manual/data-modeling/)

## Later

| Topic | Hours | Resources |
|---|---|---|
| RAG, embeddings, vector databases | ~15 | [Gemini embeddings](https://ai.google.dev/gemini-api/docs/embeddings), [pgvector](https://github.com/pgvector/pgvector) |
| Terraform (after AWS by hand) | ~15 | [Terraform tutorials](https://developer.hashicorp.com/terraform/tutorials) |
| Kubernetes, ArgoCD (concepts) | ~25 | [Kubernetes basics](https://kubernetes.io/docs/tutorials/kubernetes-basics/) |

Skip, as the transition plan says: MySQL, Azure/GCP specifics, Jenkins/CircleCI, microfrontends, Vue.
