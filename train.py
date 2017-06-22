# -*- coding:utf-8 -*-
import tensorflow as tf
import numpy as np
from tensorflow.contrib import rnn
# from tensorflow.examples.tutorials.mnist import input_data


# 模型构建
# mnist = input_data.read_data_sets('MNIST_data', one_hot=True)
# print(mnist.train.images.shape)
filename_queue = tf.train.string_input_producer(["data.csv"])
reader = tf.TextLineReader()
key, value = reader.read(filename_queue)

# Default values, in case of empty columns. Also specifies the type of the
# decoded result.
record_defaults = [[1.0], [1.0], [1.0], [1.0], [1.0], [1.0],
                   [1.0], [1.0], [1.0], [1.0], [1.0], [1.0], [1.0], [1.0], [1.0]]
col1, col2, col3, col4, col5, col6, col7, col8, col9, col10, col11, col12, col13, col14, col15 = tf.decode_csv(
    value, record_defaults=record_defaults)
feature = tf.stack([col1, col2, col3, col4, col5, col6, col7])
features = tf.reshape(feature, [-1, 7])
label = tf.stack([col8, col9, col10, col11, col12, col13, col14, col15])
labels = tf.reshape(label, [-1, 8])


lr = 1e-3
# 在训练和测试的时候，我们想用不同的 batch_size.所以采用占位符的方式
batch_size = tf.placeholder(tf.int32, [])  # 注意类型必须为 tf.int32
# batch_size = 128
# batch_size = tf.placeholder(tf.int32)

# 每个时刻的输入特征是28维的，就是每个时刻输入一行，一行有 28 个像素
input_size = 7
# 时序持续长度为28，即每做一次预测，需要先输入28行
timestep_size = 1
# 每个隐含层的节点数
hidden_size = 256
# LSTM layer 的层数
layer_num = 2
# 最后输出分类类别数量，如果是回归预测的话应该是 1
class_num = 8

_X = tf.placeholder(tf.float32, [None, input_size])
y = tf.placeholder(tf.float32, [None, class_num])
keep_prob = tf.placeholder(tf.float32)

# 把784个点的字符信息还原成 28 * 28 的图片
# 下面几个步骤是实现 RNN / LSTM 的关键
####################################################################
# **步骤1：RNN 的输入shape = (batch_size, timestep_size, input_size)
X = tf.reshape(_X, [-1, timestep_size, input_size])


def genlstmcell():
    # **步骤2：定义一层 LSTM_cell，只需要说明 hidden_size, 它会自动匹配输入的 X 的维度
    lstm_cell = rnn.BasicLSTMCell(
        num_units=hidden_size, forget_bias=1.0, state_is_tuple=True)

    # **步骤3：添加 dropout layer, 一般只设置 output_keep_prob
    lstm_cell = rnn.DropoutWrapper(
        cell=lstm_cell, input_keep_prob=1.0, output_keep_prob=keep_prob)
    return lstm_cell


# **步骤4：调用 MultiRNNCell 来实现多层 LSTM


mlstm_cell = rnn.MultiRNNCell([genlstmcell()
                               for i in range(layer_num)], state_is_tuple=True)

# **步骤5：用全零来初始化state
init_state = mlstm_cell.zero_state(batch_size, dtype=tf.float32)

# **步骤6：方法一，调用 dynamic_rnn() 来让我们构建好的网络运行起来
# ** 当 time_major==False 时， outputs.shape = [batch_size, timestep_size, hidden_size]
# ** 所以，可以取 h_state = outputs[:, -1, :] 作为最后输出
# ** state.shape = [layer_num, 2, batch_size, hidden_size],
# ** 或者，可以取 h_state = state[-1][1] 作为最后输出
# ** 最后输出维度是 [batch_size, hidden_size]
outputs, state = tf.nn.dynamic_rnn(
    mlstm_cell, inputs=X, initial_state=init_state, time_major=False)
h_state = outputs[:, -1, :]  # 或者 h_state = state[-1][1]

# *************** 为了更好的理解 LSTM 工作原理，我们把上面 步骤6 中的函数自己来实现 ***************
# 通过查看文档你会发现， RNNCell 都提供了一个 __call__()函数（见最后附），我们可以用它来展开实现LSTM按时间步迭代。
# **步骤6：方法二，按时间步展开计算
# outputs = list()
# state = init_state
# with tf.variable_scope('RNN'):
#     for timestep in range(timestep_size):
#         if timestep > 0:
#             tf.get_variable_scope().reuse_variables()
#         # 这里的state保存了每一层 LSTM 的状态
#         (cell_output, state) = mlstm_cell(X[:, timestep, :], state)
#         outputs.append(cell_output)
# h_state = outputs[-1]

# 上面 LSTM 部分的输出会是一个 [hidden_size] 的tensor，我们要分类的话，还需要接一个 softmax 层
# 首先定义 softmax 的连接权重矩阵和偏置
# out_W = tf.placeholder(tf.float32, [hidden_size, class_num], name='out_Weights')
# out_bias = tf.placeholder(tf.float32, [class_num], name='out_bias')
# 开始训练和测试
W = tf.Variable(tf.truncated_normal(
    [hidden_size, class_num], stddev=0.1), dtype=tf.float32)
bias = tf.Variable(tf.constant(0.1, shape=[class_num]), dtype=tf.float32)
y_pre = tf.nn.softmax(tf.matmul(h_state, W) + bias)


# 损失和评估函数
cross_entropy = -tf.reduce_mean(y * tf.log(y_pre))
# cross_entropy = -tf.reduce_mean(tf.nn.softmax_cross_entropy_with_logits(labels=y, logits=y_pre))
# cross_entropy = tf.reduce_mean(tf.square(y - y_pre))
train_op = tf.train.AdamOptimizer(lr).minimize(cross_entropy)

correct_prediction = tf.equal(tf.argmax(y_pre, 1), tf.argmax(y, 1))
# correct_prediction = tf.equal(y_pre, y)
# correct_prediction = y_pre-y
accuracy = tf.reduce_mean(tf.cast(correct_prediction, "float"))

# 模型构建

sess = tf.Session()
sess.run(tf.global_variables_initializer())
# Add ops to save and restore all the variables.
saver = tf.train.Saver()

# Restore variables from disk.
try:
    saver.restore(sess, "./model.ckpt")
    print("Model restored.")
except:
    print("First train!")

# Start populating the filename queue.
coord = tf.train.Coordinator()
threads = tf.train.start_queue_runners(coord=coord, sess=sess)
train_accuracy = 0
for i in range(2000):
    # Retrieve a single instance:
    input_x, input_y = sess.run([features, labels])
    # print("input %r, label %d" % (input_x, input_y))
    # print(input_y.shape)
    _batch_size = 1
    if (i + 1) % 100 == 0:
        print("Iter%d, step %d, training accuracy %g" %
              (1, (i + 1), train_accuracy / 100))
        train_accuracy = 0
    train_accuracy += sess.run(accuracy, feed_dict={
        _X: input_x, y: input_y, keep_prob: 1.0, batch_size: _batch_size})
    # 已经迭代完成的 epoch 数: mnist.train.epochs_completed
    sess.run(train_op, feed_dict={
             _X: input_x, y: input_y, keep_prob: 0.5, batch_size: _batch_size})

coord.request_stop()
coord.join(threads)

save_path = saver.save(sess, "./model.ckpt")
print("Model saved in file: %s" % save_path)

# 计算测试数据的准确率
# print("test accuracy %g" % sess.run(accuracy, feed_dict={
#     _X: mnist.test.images, y: mnist.test.labels, keep_prob: 1.0, batch_size: mnist.test.images.shape[0]}))
