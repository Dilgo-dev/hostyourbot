import { BaseGenerator } from './baseGenerator';
import { GeneratedFile } from './types';
import { WorkflowNode } from '../../types/workflow';

export class DiscordGenerator extends BaseGenerator {
  generate(): GeneratedFile[] {
    const files: GeneratedFile[] = [];

    files.push({
      filename: 'index.js',
      content: this.generateIndexFile(),
    });

    files.push({
      filename: 'package.json',
      content: this.generatePackageJson(),
    });

    files.push({
      filename: '.env.example',
      content: this.generateEnvExample(),
    });

    files.push({
      filename: 'README.md',
      content: this.generateReadme(),
    });

    return files;
  }

  private generateIndexFile(): string {
    const eventNodes = this.getEventNodes();
    const hasMessageCreate = eventNodes.some(n => n.data.blockId === 'onMessageCreate');
    const hasReady = eventNodes.some(n => n.data.blockId === 'onReady');
    const hasMemberJoin = eventNodes.some(n => n.data.blockId === 'onMemberJoin');

    const intents = this.generateIntents(hasMessageCreate, hasMemberJoin);
    const eventHandlers = this.generateEventHandlers();

    return `const { Client, GatewayIntentBits } = require('discord.js');
require('dotenv').config();

const client = new Client({
  intents: [${intents}],
});

${eventHandlers}

client.login(process.env.DISCORD_TOKEN);
`;
  }

  private generateIntents(hasMessageCreate: boolean, hasMemberJoin: boolean): string {
    const intents = ['GatewayIntentBits.Guilds'];

    if (hasMessageCreate) {
      intents.push('GatewayIntentBits.GuildMessages');
      intents.push('GatewayIntentBits.MessageContent');
    }

    if (hasMemberJoin) {
      intents.push('GatewayIntentBits.GuildMembers');
    }

    return intents.map(intent => `\n    ${intent}`).join(',') + ',\n  ';
  }

  private generateEventHandlers(): string {
    const eventNodes = this.getEventNodes();
    let handlers = '';

    for (const eventNode of eventNodes) {
      handlers += this.generateEventHandler(eventNode) + '\n';
    }

    return handlers;
  }

  private generateEventHandler(eventNode: WorkflowNode): string {
    const blockId = eventNode.data.blockId;

    switch (blockId) {
      case 'onReady':
        return this.generateOnReadyHandler(eventNode);
      case 'onMessageCreate':
        return this.generateOnMessageCreateHandler(eventNode);
      case 'onMemberJoin':
        return this.generateOnMemberJoinHandler(eventNode);
      default:
        return '';
    }
  }

  private generateOnReadyHandler(eventNode: WorkflowNode): string {
    const actions = this.getConnectedNodes(eventNode.id);
    let actionsCode = '  console.log(`✅ Bot connecté en tant que ${client.user.tag}`);\n';

    for (const action of actions) {
      actionsCode += this.generateActionCode(action, 'ready', 2);
    }

    return `client.on('ready', () => {\n${actionsCode}});
`;
  }

  private generateOnMessageCreateHandler(eventNode: WorkflowNode): string {
    const actions = this.getConnectedNodes(eventNode.id);
    const command = eventNode.data.config?.command;

    let condition = '  if (message.author.bot) return;\n';
    let actionsCode = '';

    if (command) {
      condition += `  \n  if (message.content === '${command}') {\n`;
      for (const action of actions) {
        actionsCode += this.generateActionCode(action, 'message', 4);
      }
      actionsCode += '  }\n';
    } else {
      for (const action of actions) {
        actionsCode += this.generateActionCode(action, 'message', 2);
      }
    }

    return `client.on('messageCreate', async (message) => {\n${condition}${actionsCode}});
`;
  }

  private generateOnMemberJoinHandler(eventNode: WorkflowNode): string {
    const actions = this.getConnectedNodes(eventNode.id);
    let actionsCode = '';

    for (const action of actions) {
      actionsCode += this.generateActionCode(action, 'member', 2);
    }

    return `client.on('guildMemberAdd', async (member) => {\n${actionsCode}});
`;
  }

  private generateActionCode(actionNode: WorkflowNode, context: string, indentLevel: number): string {
    const blockId = actionNode.data.blockId;
    const indent = '  '.repeat(indentLevel);

    switch (blockId) {
      case 'sendMessage':
        return this.generateSendMessageAction(actionNode, context, indent);
      case 'addRole':
        return this.generateAddRoleAction(actionNode, context, indent);
      case 'createChannel':
        return this.generateCreateChannelAction(actionNode, context, indent);
      default:
        return '';
    }
  }

  private generateSendMessageAction(actionNode: WorkflowNode, context: string, indent: string): string {
    const messageContent = actionNode.data.config?.messageContent || 'Message par défaut';
    const channelId = actionNode.data.config?.channelId;

    const escapedContent = messageContent.replace(/'/g, "\\'").replace(/\n/g, '\\n');

    if (channelId) {
      return `${indent}const channel = client.channels.cache.get('${channelId}');\n${indent}if (channel) await channel.send('${escapedContent}');\n`;
    } else {
      if (context === 'message') {
        return `${indent}await message.channel.send('${escapedContent}');\n`;
      } else if (context === 'member') {
        return `${indent}const channel = member.guild.systemChannel;\n${indent}if (channel) await channel.send('${escapedContent}');\n`;
      } else {
        return `${indent}console.log('Action sendMessage non supportée dans ce contexte');\n`;
      }
    }
  }

  private generateAddRoleAction(actionNode: WorkflowNode, context: string, indent: string): string {
    const roleId = actionNode.data.config?.roleId;

    if (!roleId) {
      return `${indent}console.log('⚠️  Rôle non configuré');\n`;
    }

    if (context === 'member') {
      return `${indent}const role = member.guild.roles.cache.get('${roleId}');\n${indent}if (role) await member.roles.add(role);\n`;
    } else if (context === 'message') {
      return `${indent}const role = message.guild?.roles.cache.get('${roleId}');\n${indent}if (role && message.member) await message.member.roles.add(role);\n`;
    } else {
      return `${indent}console.log('Action addRole non supportée dans ce contexte');\n`;
    }
  }

  private generateCreateChannelAction(actionNode: WorkflowNode, context: string, indent: string): string {
    const channelName = actionNode.data.config?.channelName || 'nouveau-salon';

    if (context === 'member') {
      return `${indent}await member.guild.channels.create({ name: '${channelName}' });\n`;
    } else if (context === 'message') {
      return `${indent}if (message.guild) await message.guild.channels.create({ name: '${channelName}' });\n`;
    } else {
      return `${indent}console.log('Action createChannel non supportée dans ce contexte');\n`;
    }
  }

  private generatePackageJson(): string {
    return JSON.stringify(
      {
        name: 'discord-bot',
        version: '1.0.0',
        description: 'Bot Discord généré avec HostYourBot',
        main: 'index.js',
        scripts: {
          start: 'node index.js',
        },
        dependencies: {
          'discord.js': '^14.14.1',
          dotenv: '^16.3.1',
        },
        author: '',
        license: 'ISC',
      },
      null,
      2
    );
  }

  private generateEnvExample(): string {
    return `DISCORD_TOKEN=your_discord_bot_token_here
`;
  }

  private generateReadme(): string {
    return `# Bot Discord

Bot Discord généré automatiquement avec HostYourBot.

## Installation

1. Installez les dépendances :
\`\`\`bash
npm install
\`\`\`

2. Créez un fichier \`.env\` à partir de \`.env.example\` :
\`\`\`bash
cp .env.example .env
\`\`\`

3. Ajoutez votre token Discord dans le fichier \`.env\` :
\`\`\`
DISCORD_TOKEN=votre_token_discord
\`\`\`

## Démarrage

Lancez le bot avec :
\`\`\`bash
npm start
\`\`\`

## Obtenir un token Discord

1. Rendez-vous sur https://discord.com/developers/applications
2. Créez une nouvelle application
3. Allez dans l'onglet "Bot"
4. Cliquez sur "Add Bot"
5. Copiez le token
6. Activez les "Message Content Intent" dans les Privileged Gateway Intents

## Inviter le bot

1. Allez dans l'onglet "OAuth2" > "URL Generator"
2. Sélectionnez le scope "bot"
3. Sélectionnez les permissions nécessaires
4. Copiez l'URL et invitez le bot sur votre serveur

---

Généré avec ❤️ par [HostYourBot](https://hostyourbot.com)
`;
  }
}
