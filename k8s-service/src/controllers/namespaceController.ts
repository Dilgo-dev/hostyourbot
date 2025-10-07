import { FastifyRequest, FastifyReply } from 'fastify';
import { K8sClient } from '../services/k8sClient';
import { Namespace } from '../types/k8s';

const k8sClient = new K8sClient();

export const listNamespaces = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const namespaces = await k8sClient.listNamespaces();
    reply.send(namespaces);
  } catch (error: any) {
    reply.status(500).send({ error: 'Failed to list namespaces', message: error.message });
  }
};

export const getNamespace = async (
  request: FastifyRequest<{ Params: { name: string } }>,
  reply: FastifyReply
) => {
  try {
    const namespace = await k8sClient.getNamespace(request.params.name);
    reply.send(namespace);
  } catch (error: any) {
    reply.status(404).send({ error: 'Namespace not found', message: error.message });
  }
};

export const createNamespace = async (
  request: FastifyRequest<{ Body: Namespace }>,
  reply: FastifyReply
) => {
  try {
    const namespace = await k8sClient.createNamespace(request.body);
    reply.status(201).send(namespace);
  } catch (error: any) {
    reply.status(400).send({ error: 'Failed to create namespace', message: error.message });
  }
};

export const deleteNamespace = async (
  request: FastifyRequest<{ Params: { name: string } }>,
  reply: FastifyReply
) => {
  try {
    await k8sClient.deleteNamespace(request.params.name);
    reply.status(204).send();
  } catch (error: any) {
    reply.status(400).send({ error: 'Failed to delete namespace', message: error.message });
  }
};
