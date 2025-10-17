import { FastifyRequest, FastifyReply } from 'fastify';
import { K8sClient } from '../services/k8sClient';
import { Service } from '../types/k8s';

const k8sClient = new K8sClient();

export const listServices = async (
  request: FastifyRequest<{ Params: { namespace?: string } }>,
  reply: FastifyReply
) => {
  try {
    const namespace = request.params.namespace || 'default';
    const services = await k8sClient.listServices(namespace);
    reply.send(services);
  } catch (error: any) {
    reply.status(500).send({ error: 'Failed to list services', message: error.message });
  }
};

export const getService = async (
  request: FastifyRequest<{ Params: { name: string; namespace?: string } }>,
  reply: FastifyReply
) => {
  try {
    const namespace = request.params.namespace || 'default';
    const service = await k8sClient.getService(request.params.name, namespace);
    reply.send(service);
  } catch (error: any) {
    reply.status(404).send({ error: 'Service not found', message: error.message });
  }
};

export const createService = async (
  request: FastifyRequest<{ Body: Service; Params: { namespace?: string } }>,
  reply: FastifyReply
) => {
  try {
    const namespace = request.params.namespace || 'default';
    const service = await k8sClient.createService(request.body, namespace);
    reply.status(201).send(service);
  } catch (error: any) {
    reply.status(400).send({ error: 'Failed to create service', message: error.message });
  }
};

export const deleteService = async (
  request: FastifyRequest<{ Params: { name: string; namespace?: string } }>,
  reply: FastifyReply
) => {
  try {
    const namespace = request.params.namespace || 'default';
    await k8sClient.deleteService(request.params.name, namespace);
    reply.status(204).send();
  } catch (error: any) {
    reply.status(400).send({ error: 'Failed to delete service', message: error.message });
  }
};
